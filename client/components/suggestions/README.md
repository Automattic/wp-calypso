# Suggestions (JSX)

Suggestions is a component which works with `SearchCard` to display suggested search terms.

## Usage

`Suggestions` is passed an array of `suggestions` which will display in a list. The way this is usually implemented is to supply a list of possible values in the parent class, and filter these using the query in `SearchCard`, passing the remaining suggestions to the `<Suggestions />` component.

For example:

```jsx
import SearchCard from 'components/search-card';
import Suggestions from 'components/suggestions';

class SuggestionsExample extends Component {

	static hints = [ 'Foo', 'Bar', 'Baz' ];

	state = {
		query: '',
	};

	setSuggestionsRef = ref => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { query: '' } );

	handleSearch = query => this.setState( { query: query } );

	handleKeyDown = event => this.suggestionsRef.handleKeyEvent( event );

	getSuggestions() {
		return SuggestionsExample.hints
			.filter( hint => this.state.query && hint.match( new RegExp( this.state.query, 'i' ) ) )
			.map( hint => ( { label: hint } ) );
	}

	suggestions = {
		return [
			{ label: 'Foo' },
			{ label: 'Bar' },
			{ label: 'Baz' },
		]
	};

	render() {
		return (
			<div className="docs__suggestions-container">
				<SearchCard
					disableAutocorrect
					onSearch={ this.handleSearch }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleKeyDown }
					placeholder="Type something..."
				/>
				<Suggestions
					ref={ this.setSuggestionsRef }
					query={ this.state.query }
					suggestions={ this.suggestions }
					suggest={ noop }
				/>
			</div>
		);
	}
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
- `suggestions`: (arry) An array of possible suggestions that match the query, made of objects of the shape `{ label: 'Label', category: 'This is optional' }
- `suggest`: A function that is called when the suggestion is selected.
