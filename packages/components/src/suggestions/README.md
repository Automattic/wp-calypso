# Suggestions (JSX)

Suggestions is a component which works with `SearchCard` to display suggested search terms.

## Usage

`Suggestions` is passed an array of `suggestions` which will display in a list. The way this is usually implemented is to supply a list of possible values in the parent class, and filter these using the query in `SearchCard`, passing the remaining suggestions to the `<Suggestions />` component.

For example:

```jsx
import React, { useCallback, useMemo, useState } from 'react';
import { Suggestions } from '@automattic/components';

export default function SuggestionsExample() {
	const [ query, setQuery ] = useState( '' );
	const updateInput = useCallback( e => setQuery( e.target.value ), [ setQuery ] );

	const suggestions = useMemo( () => {
		if ( ! query ) {
			return [];
		}
		const allSuggestions = [ 'Foo', 'Bar', 'Baz' ].map( s => ( { label: s, value: s } ) );
		const r = new RegExp( query, 'i' );
		return allSuggestions.filter( ( { label } ) => r.test( label ) );
	}, [ query ] );

	return (
		<div className="docs__suggestions-container">
			<input
				type="text"
				value={ query }
				onChange={ updateInput }
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="off"
				spellCheck={ false }
				placeholder="Type Foo, Bar or Baz…"
			/>
			<Suggestions
				query={ query }
				suggestions={ suggestions }
				suggest={ ( ...args ) => {
					// eslint-disable-next-line no-console
					console.log( 'Suggest callback invoked with args: %o', args );
				} }
			/>
		</div>
	);
}
```

The suggestion list also supports headings by adding a category field to the suggestions. Suggestions with the same category value are grouped together under the heading. Suggestions with no category will always appear at the top of the list.

For example:

```jsx
const FoodSuggestions = React.forwardRef( ( props, ref ) => (
	<Suggestions
		ref={ ref }
		query=""
		suggest={ props.suggest }
		suggestions={ [
			{ label: 'Oats' },
			{ label: 'Apple', category: 'Fruit' },
			{ label: 'Orange', category: 'Fruit' },
			{ label: 'Carrot', category: 'Vegetable' },
		] }
	/>
) );
```

## Props

The following props are available:

- `query`: (string) The search query that the suggestions are based on. Will be highlighted in the suggestions.
- `suggestions`: ({label: string, category?: string, ...otherProps}[]) An array of possible suggestions that match the query, made of objects of the shape `{ label: 'Label', category: 'This is optional' }
- `suggest`: A function that is called when the suggestion is selected.
