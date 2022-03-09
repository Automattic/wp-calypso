# IntentScreen

Currently used in WordPress.com signup flow. This step gives the user a few different starting points to choose from and an additional alternative at the bottom.

## Props

| Name            | Type            | Required | Description                                                                                  |
| --------------- | --------------- | -------- | -------------------------------------------------------------------------------------------- |
| `intents`       | `SelectItem`    | yes      | Main items listed with text and buttons. See type description below.                         |
| `intentsAlt`    | `SelectAltItem` | yes      | Alternative option styled without a button and placed at the end. See type description below.|
| `onSelect`      | `function`      | yes      | ( **value** ) Callback to run when an item is selected. This should have no return.          |
| `preventWidows` | `function`      | yes      | ( **text, wordsToKeep** - _optional_ )  Wrapper for the _intents_ title and description.     |

## SelectItems

Items used in the IntentScreen. They consist of a title, description, and icon.

### Props

- **key** _string_ - unique identifier for the item.
- **title** _string_ - text to use as the header for the item.
- **description** _string_ - text explaining the item, not translated or wrapped.
- **icon**: _ReactElement_ - uses WordPress _Icon_ component and sets it to 24px
- **value**: _string_ - passed to onClick/onSelect handler to identify the item.
- **actionText**: _sring_ - text for the button.
- **hidden**: _boolean_ - if true, item is hidden.

## SelectAltItem

This is the final item in IntentScreen and does not have a button or icon.

### Props

- **show**: _boolean_ - if false, this item is shown.
- **key**: _string_ - unique identifier for the item.
- **description**: _string_ - text explaining the item, not translated or wrapped.
- **value**: _string_ - passed to onClick/onSelect handler to identify the item.
- **actionText**: _string_ - text used for the link to the action.
- **disable**: _boolean_ - if true, disable _actionText_ and show _ToolTip_.
- **disableText**: _string_ - text to provide context in the _ToolTip_.
