# Bulk Select

This component is used to implement a checkbox which you can use to bulk select a list of elements

## How to use

```jsx
import BulkSelect from 'calypso/components/bulk-select';

function render() {
	return <BulkSelect selectedElements={ 3 } totalElements={ 6 } onToggle={ callback } />;
}
```

## Props

- `selectedElements`: (number) The number of elements currently selected
- `totalElements`: (number) The number of all the elements that can be selected
- `onToggle`: (function) callback to be executed when the checkbox state is change. The callback receives a boolean indicating the state of the 'select all' checkbox, and normally you would want to apply it to the list of elements here.
