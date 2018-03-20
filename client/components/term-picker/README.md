TermPicker
==========

Term picker component: displays a list of terms (monthly, yearly, biennially).

### `index.jsx`

Given an array of plans, this component creates a corresponding list of TermPickerOption components to allow
selection of desired term.

Each item in the `plans` array must be a constant from lib/plans/contants.jsx`.

#### Props

* `plans`: string[] list of plan constants representing term options
* `initialValue`: string ( optional ) term selected by default
* `onChange`: function({value}) => void ( optional ) A callback called when selected term changes

For a complete list of props along with their types, please refer to the `TermPicker` component's `propTypes` member.
