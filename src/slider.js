const TOTAL_DATA = 500;
const TOTAL_STEPS = 50;
const OFFSET = 5;
let isSelectedRangeDragging = false;
const root = document.querySelector(":root");
const rootVars = getComputedStyle(root);
const sliderEl = document.querySelector("#sliderScale");
const sliderRangeEl = document.querySelector("#sliderRange");
const selectedRangeEl = sliderRangeEl.querySelector("#rangeSelected");
const selectedRangeStartEl = sliderRangeEl.querySelector("#rangeLeft");
const selectedRangeEndEl = sliderRangeEl.querySelector("#rangeRight");
const STEP_WIDTH = parseInt(rootVars.getPropertyValue("--step-width"), 10);
const data = Array(TOTAL_DATA)
  .fill(null)
  .map((_, idx) => idx + 1);
const compositeData = [];
let sliderItems = [];
const selectedRange = {
  start: null,
  end: null,
};

const renderSlider = () => {
  sliderItems.forEach((i) => {
    const listItem = document.createElement("li");
    listItem.classList += "slider-item";
    listItem.innerText = i;
    sliderEl.appendChild(listItem);
  });
  sliderRangeEl.style.width = `${TOTAL_STEPS * STEP_WIDTH}px`;
};

const renderRangeSelection = () => {
  const selectedRangeSteps = selectedRange.end - selectedRange.start + 1;
  selectedRangeEl.style.transform = `translateX(${
    selectedRange.start * STEP_WIDTH
  }px)`;
  selectedRangeEl.style.width = `${STEP_WIDTH * selectedRangeSteps}px`;
};

const generateSliderValues = () => {
  if (!selectedRange.start && !selectedRange.end) {
    selectedRange.start = 0;
    selectedRange.end = 1;
  }
  const steps = Array(TOTAL_STEPS)
    .fill(null)
    .map((_, idx) => idx + 1);
  const adjustedSelectedRangeStart = selectedRange.start - OFFSET;
  const adjustedSelectedRangeEnd = selectedRange.end + OFFSET;
  const range = {
    start: adjustedSelectedRangeStart > 0 ? adjustedSelectedRangeStart : 0,
    end:
      adjustedSelectedRangeEnd > steps.length - 1
        ? adjustedSelectedRangeEnd
        : steps.length - 1,
  };

  sliderItems = [];

  steps.forEach((dataItem, dataItemIdx) => {
    if (
      dataItemIdx === 0 ||
      dataItemIdx === steps.length - 1 ||
      (dataItemIdx >= range.start && dataItemIdx <= range.end)
    ) {
      sliderItems.push(dataItem);
      return;
    }
  });
};

const handleSelectedRangePositionChange = (position) => {
  const rangeStepCount = getSelectedRangeSteps();
  selectedRange.start = position / STEP_WIDTH + 1;
  selectedRange.end = selectedRange.start + rangeStepCount - 1;

  // Prepare composite data for the selected range
  compositeData.length = 0; // Clear previous data
  const offsetRange = {
    start: selectedRange.start - OFFSET < 0 ? 0 : selectedRange.start - OFFSET,
    end:
      selectedRange.end + OFFSET > TOTAL_STEPS
        ? TOTAL_STEPS
        : selectedRange.end + OFFSET,
  };
  const rawPoints = rangeStepCount + OFFSET * 2;
  const groupDataLength = data.length - rawPoints;
  const groupStepSize = Math.floor(groupDataLength / TOTAL_STEPS);

  for (let i = 0; i <= offsetRange.start; i++) {
    compositeData.push(data[i * groupStepSize]);
  }
  for (let i = offsetRange.start + 1; i < offsetRange.end; i++) {
    compositeData.push(data[i]);
  }
  for (let i = offsetRange.end; i <= TOTAL_STEPS; i++) {
    compositeData.push(data[i * groupStepSize]);
  }
  console.log({ groupDataLength, groupStepSize, selectedRange, compositeData });
};

const render = () => {
  generateSliderValues();
  renderSlider();
  renderRangeSelection();
};

const moveSlider = (moveUnit) => {
  selectedRangeEl.style.transform = `translateX(${moveUnit}px)`;
};

const getSelectedRangeSteps = () => {
  return selectedRange.end - selectedRange.start + 1;
};

const getSelectedRangeWidth = () => {
  return getSelectedRangeSteps() * STEP_WIDTH;
};

const getSliderWidth = () => {
  return TOTAL_STEPS * STEP_WIDTH;
};

const handleDragStart = () => {
  isSelectedRangeDragging = true;
};

const handleDragStop = ({ clientX }) => {
  const position = clientX - 25;
  const remainder = position % STEP_WIDTH;
  isSelectedRangeDragging = false;

  if (remainder === 0) {
    moveSlider(position);
    handleSelectedRangePositionChange(position);
  } else {
    const adjustedPosition =
      remainder < STEP_WIDTH / 2
        ? position - remainder
        : position + STEP_WIDTH - remainder;
    moveSlider(adjustedPosition);
    handleSelectedRangePositionChange(adjustedPosition);
  }
};

const handleDrag = ({ clientX }) => {
  if (!isSelectedRangeDragging) return;

  const selectedRangeWidth = getSelectedRangeWidth();
  const sliderWidth = getSliderWidth();
  const position = clientX - 25;
  const isOverflown = {
    left: position < 0,
    right: position + selectedRangeWidth > sliderWidth,
  };

  if (isOverflown.left) {
    isSelectedRangeDragging = false;
    moveSlider(0);
  } else if (isOverflown.right) {
    isSelectedRangeDragging = false;
    moveSlider(sliderWidth - selectedRangeWidth);
  } else {
    moveSlider(position);
  }
};

const init = () => {
  render();
  sliderRangeEl.addEventListener("mousedown", handleDragStart);
  sliderRangeEl.addEventListener("mouseup", handleDragStop);
  sliderRangeEl.addEventListener("mousemove", handleDrag);
};

init();
