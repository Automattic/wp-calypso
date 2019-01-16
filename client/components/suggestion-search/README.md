SuggestionSearch
================

SuggestionSearch is a bundled component of FormTextInput and Suggestions which encapsulates the common boilerplate code for pairing them.

## Usage

```es6
import SuggestionSearch from 'components/suggestion-search';

onChange( newValue ) {
	console.log( 'New value: ', newValue );
}

render() {
	return (
		<SuggestionSearch
			placeholder={ 'Type here to search' }
			onChange={ onChange }
			suggestions={ [ 'foo', 'bar' ] }
		/>
	);
}

```

See the [example](./example/example.jsx).

## Props

### `{String} id`
It's common that this component is used in a form. This `id` prop is passed to the underlying FormTextInput so that you can associate a FormLabel with it easily.


### `{String} placeholder`
The placeholder text to show if there has nothing been entered yet.

### `{Func} onChange`
The callback function for receiving updated value, whether it's by typing, autocompletion, or suggestion picking.

### `{Func} sortResults` 
An optional method for sorting the results that we display in the suggestion list.

#### Returns
`Array` A sorted array

### `{Array} suggestions`
A list of candidate strings that a user can pick from upon typing.
