SiteVerticalsSuggestionSearch
================

As a wrapper for `<SuggestionSearch />`, SiteVerticalsSuggestionSearch fetches suggestions from the verticals API endpoint.

## Usage

```es6
import SiteVerticalsSuggestionSearch from 'components/site-verticals-suggestion-search';

onChange( newValue ) {
	console.log( 'New value: ', newValue );
}

render() {
	return (
		<SiteVerticalsSuggestionSearch
			onChange={ this.onChange }
			initialValue={ this.state.initialValue }
		/>
	);
}

```

## Props

### _(String)_ `initialValue`
An _optional_ initial value of the search input field. Default is `''`;

### _(String)_ `placeholder`
_Optional_ placeholder text for the search input field.

### _(Function)_ `onChange` 
The callback function for receiving updated value. 
