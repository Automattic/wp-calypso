SubscriptionLengthPicker
==========

isplays a list of terms (monthly, yearly, biennially).

### `index.jsx`

Given an array of plans, this component creates a corresponding list of TermPickerOption components to allow
selection of desired term.

Each item in the `plans` array must be a constant from lib/plans/contants.jsx`.

#### Props

* `plans`: string[] list of plan constants representing term options
* `initialValue`: string ( optional ) term selected by default
* `onChange`: function({value}) => void ( optional ) A callback called when selected term changes

For a complete list of props along with their types, please refer to the `SubscriptionLengthPicker` component's `propTypes` member.

SubscriptionLengthOption
==========

Represents a term that user could pick when choosing his plan (monthly, yearly, biennially)

### `index.jsx`

Given basic information, this component creates a representation of given term.

#### Props

* `term`: string - TERM_* constant from lib/plans/constants.jsx
* `savePercent` number ( optional ) - e.g. 60 for 60% - when displayed with other terms,
                                      if may be useful to say that one option is 40% cheaper
                                      then the other.
* `price`: string - e.g. $60 - a formatted full price that is going to be charged to the user
* `pricePerMonth`: string - e.g. $5 - a formatted effective price per month
* `checked`: bool - if this option should be checked (selected)
* `value`: any - value that is going to be passed to onChecked callback
* `onCheck`: function({value}) => void ( optional ) A callback called when this term is checked (selected)

For a complete list of props along with their types, please refer to the `SubscriptionLengthOption` component's `propTypes` member.
