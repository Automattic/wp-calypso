Add new button
===========

This component implements a button styled to be used in 'add' actions.

## Usage

```jsx
import AddNewButton from 'components/add-new-button';

export default React.createClass( {
	render: () => <AddNewButton icon="pages">Link</AddNewButton>
} );

```

## Props

- `href`: String with the destination url.
- `onClick`: Function to be executed when the button is clicked
- `isCompact`: Boolean indicating whether the button is in compact mode. Defaults to false.
- `outline`: Boolean indicating whether the button has an outline. Defaults to false.
- `icon`: String indicating which Gridicon we are going to use for the button. Defaults to `add` or `add-outline`, depending on `outline` value