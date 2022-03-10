# SelectItems

Items used in the IntentScreen. They consist of a title, description, and icon.

## Props

- **key** _string_ - unique identifier for the item.
- **title** _string_ - text to use as the header for the item.
- **description** _string_ - text explaining the item, not translated or wrapped.
- **icon**: _ReactElement_ - uses WordPress _Icon_ component and sets it to 24px
- **value**: _string_ - passed to onClick/onSelect handler to identify the item.
- **actionText**: _sring_ - text for the button.
- **hidden**: _boolean_ - if true, item is hidden.
