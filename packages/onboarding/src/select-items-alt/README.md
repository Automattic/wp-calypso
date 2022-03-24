
# SelectAltItem

This is the final item in IntentScreen and does not have a button or icon.

## Props

- **show**: _boolean_ - if false, this item is shown.
- **key**: _string_ - unique identifier for the item.
- **description**: _string_ - text explaining the item, not translated or wrapped.
- **value**: _string_ - passed to onClick/onSelect handler to identify the item.
- **actionText**: _string_ - text used for the link to the action.
- **disable**: _boolean_ - if true, disable _actionText_ and show _ToolTip_.
- **disableText**: _string_ - text to provide context in the _ToolTip_.
