# IntentScreen

Currently used in WordPress.com signup flow. This step gives the user a few different starting points to choose from and an additional alternative at the bottom.

## Props

| Name            | Type            | Required | Description                                                                                  |
| --------------- | --------------- | -------- | -------------------------------------------------------------------------------------------- |
| `intents`       | `SelectItem`    | yes      | Main items listed with text and buttons. See type description below.                         |
| `intentsAlt`    | `SelectAltItem` | yes      | Alternative option styled without a button and placed at the end. See type description below.|
| `onSelect`      | `function`      | yes      | ( **value** ) Callback to run when an item is selected. This should have no return.          |
| `preventWidows` | `function`      | yes      | ( **text, wordsToKeep** - _optional_ )  Wrapper for the _intents_ title and description.     |
