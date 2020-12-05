# ThreatDialog

`<ThreatDialog />` is a React component for rendering a modal which lets a user fix or ignore a threat.

## Usage

```jsx
import ThreatDialog from 'client/components/jetpack/threat-dialog';

export default function MyComponent() {
	return (
		<ThreatDialog
			threatId={ 123 }
			threatTitle={ 'Title...' }
			threatDescription="Description..."
			action="fix"
			siteName="WordPress.com"
			showDialog
			onCloseDialog={ () => console.log( 'Closing this dialog...' ) }
			onConfirmation={ () => console.log( 'Fixing this threat...' ) }
		/>
	);
}
```

## Props

The following props can be passed to the `<ThreatDialog />` component:

### `threatId`

A number that uniquely identifies a threat.

### `threatTitle`

A string that represents a summary of the threat.

### `threatDescription`

A string or ReactNode that contains a description of the threat.

### `action`

A string that can be either 'fix' or 'ignore'. It refers to what is going to be done about the threat.

### `siteName`

A string with the name of the selected site.

### `showDialog`

A boolean that controls whether the dialog/modal should be displayed or not.

### `onCloseDialog`

A function that gets executed when the cancel button is clicked.

### `onConfirmation`

A function that gets executed when the confirmation button is clicked. Either the "Ignore threat" or "Fix threat" button was clicked.
