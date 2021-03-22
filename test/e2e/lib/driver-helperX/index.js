/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import { find } from "lodash-es";

const element = {
	findElement,
	findElements,
	findElementIfVisible,
	findElementIfClickable,
	findElementIfFocused,
	findFieldIfClearable,
	findImageIfVisible,
	highlightElement,
};


const is = {
	elementLocated,
	elementNotLocated,
	elementLocatedAndVisible,
	elementClickable,
	elementFocused,
	fieldClearable,
	imageVisible,
};

const isEventually = {
	elementLocated,
	elementNotLocated,
	elementLocatedAndVisible,
	elementClickable,
	elementFocused,
	fieldClearable,
	imageVisible,
};

const until = {
	elementLocated,
	elementNotLocated,
	elementLocatedAndVisible,
	elementClickable,
	elementFocused,
	fieldClearable,
	imageVisible,
};

const ensure = {
	elementLocated,
	elementNotLocated,
	elementLocatedAndVisible,
	elementClickable,
	elementFocused,
	fieldClearable,
	imageVisible,
};

const _do = {
	clickWhenClickable,
	clearWhenClearable, // waitForFieldClearable
	setWhenSettable,
	clickIfPresent,
	setCheckbox,
	unsetCheckbox,
	scrollIntoView,
	clear, // clearTextArea ?? clearWhenClearable ??
  dismissAlertIfPresent,
	acceptAlertIfPresent,
};

const window = {
	refreshIfJNError,
	switchToWindowByIndex, // switchToWindowByIndex
	closeCurrentWindow, //closeCurrentWindow
	countOpenWindows,
	printConsole,
	sendErrorsToSlack,
	logPerformance,
};

/******************************************************/

const index = {
	findElement,
	findElements,
  countElements, //getElementCount
  clickWhenClickable,
	clearWhenClearable, // waitForFieldClearable
	setWhenSettable,
	clickIfPresent,
	setCheckbox,
	unsetCheckbox,
	scrollIntoView,
	clear, // clearTextArea ?? clearWhenClearable ??
  dismissAlertIfPresent,
	acceptAlertIfPresent,
	refreshIfJNError,
	switchToWindowByIndex, // switchToWindowByIndex
	closeCurrentWindow, //closeCurrentWindow
	countOpenWindows,
	printConsole,
	sendErrorsToSlack,
	logPerformance,
	is: {},
	isEventually: {},
	ensure: {},
  do: {},
	window: {},
};

isElementClickable
isElementEventuallyClickable
isFieldClearable
isFieldEventuallyClearable
isImageEventuallyVisible
isImageVisible
waitUntilElementClickable
waitUntilFieldClearable
waitUntilImageVisible

const element = {
  find,
  findAll,
  is: {
    located,
    locatedAndVisible,
    eventually: {
      located,
    }
  },
  ensure: {
    located
  }
}
