SiteVerticalsSuggestionSearch
================

As a wrapper for `<SuggestionSearch />`, SiteVerticalsSuggestionSearch fetches suggestions from the verticals API endpoint.

## Usage

```es6
import SiteVerticalsSuggestionSearch from 'components/site-verticals-suggestion-search';

onChange( { vertical_name, vertical_slug, vertical_id } ) {
	console.log( 'New vertical values: ', vertical_name, vertical_slug, vertical_id );
}

render() {
	return (
		<SiteVerticalsSuggestionSearch
			onChange={ this.onChange }
			initialValue={ this.state.initialValue }
			charsToTriggerSearch={ 3 }
		/>
	);
}

```

## Props

### _(String)_ `initialValue`
An _optional_ initial value of the search input field. Default is `''`;

### _(String)_ `placeholder`
_Optional_ placeholder text for the search input field.

### _(Integer)_ `charsToTriggerSearch`
_Optional_ number of characters before an API search is triggered.

### _(Function)_ `onChange` 
The callback function for receiving updated value.

### _(Boolean)_ `showPopular` 
_Optional_ Informs the component whether to show a list of popular vertical topics when the input field is empty.

Returns _{Object}_:

```json
{
  "vertical_name": "Restaurant",
  "vertical_slug": "Restaurant",
  "vertical_id": "p1",
  "preview": {
    "cover_image": "https://…",
    "cover_image_text": "Yum yum foods here.",
    "headline": "About us",
    "text": "Nothing but yum yum foods here."
  }
}

```


