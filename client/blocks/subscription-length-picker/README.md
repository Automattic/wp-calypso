# Subscription Length Option

Represents a term that user could pick when choosing his plan (monthly, yearly, biennially)

## `index.jsx`

Given basic information, this component creates a representation of given term.

### Props

- `checked`: bool - if this option should be checked (selected)
- `onCheck`: function({value}) => void ( optional ) A callback called when this term is checked (selected)
- `price`: string - e.g. \$60 - a formatted full price that is going to be charged to the user
- `pricePerMonth`: string - e.g. \$5 - a formatted effective price per month
- `savePercent` number ( optional ) - e.g. 60 for 60% - when displayed with other terms,
  if may be useful to say that one option is 40% cheaper
  then the other.
- `term`: string - TERM\_\* constant from lib/plans/constants.jsx
- `value`: any - value that is going to be passed to onChecked callback

For a complete list of props along with their types, please refer to the `SubscriptionLengthOption` component's `propTypes` member.
