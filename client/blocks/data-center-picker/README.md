# Data Center Picker (TSX)

This component displays a data center picker. It lets the user choose between our recommended data center or through a custom list of avaliable data centers.

## How to use

```js
import DataCenterPicker from 'calypso/blocks/data-center-picker';

function render() {
	return <DataCenterPicker />;
}
```

## Props

- `onChange (func)` - A function to handle the event callback when choosing a data center or picking the recommended one.
- `value (string)` - The picked data center (this is a controlled component).
