TermPickerOption
==========

Term picker option component: represents a term that user could pick when choosing his plan
(monthly, yearly, biennially)

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

For a complete list of props along with their types, please refer to the `TermPickerOption` component's `propTypes` member.
