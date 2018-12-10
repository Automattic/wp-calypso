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

## Props

### `id`
It's common that this component is used in a form. This `id` prop is passed to the underlying FormTextInput so that you can associate a FormLabel with it easily.


### `placeholder`
The placeholder text to show if there has nothing been entered yet.

### `onChange`
The callback function for receiving updated value, whether it's by typing, autocompletion, or suggestion picking.

### `suggestions`
A list of candidate strings that a user can pick from upon typing.
