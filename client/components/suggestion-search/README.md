# SuggestionSearch

SuggestionSearch is a bundled component of FormTextInput and Suggestions which encapsulates the common boilerplate code for pairing them.

## Usage

```jsx
import SuggestionSearch from 'calypso/components/suggestion-search';

function onChange( newValue, isNavigating ) {
	console.log( 'New value: ', newValue, 'isNavigating:', isNavigating );
}

function render() {
	return (
		<SuggestionSearch
			placeholder={ 'Type here to search' }
			onChange={ onChange }
			suggestions={ [ { label: 'foo' }, { label: 'bar' } ] }
		/>
	);
}
```

See the [example](./example/example.jsx).

## Props

### `{string} id`

It's common that this component is used in a form. This `id` prop is passed to the underlying FormTextInput so that you can associate a FormLabel with it easily.

### `{string} placeholder`

The placeholder text to show if nothing has been entered yet.

### `{Func} onChange`

The callback function for receiving updated value, whether it's by typing, autocompletion, or suggestion picking. If a user is navigating through the list, it will pass an additional `true` as the 2nd argument.

### `{Func} sortResults`

An optional method for sorting the results that we display in the suggestion list.

#### Returns

`Array` A sorted array

### `{Array} suggestions`

A list of candidate strings that a user can pick from upon typing.
