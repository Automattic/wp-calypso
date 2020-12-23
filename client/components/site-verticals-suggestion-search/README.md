# SiteVerticalsSuggestionSearch

As a wrapper for `<SuggestionSearch />`, SiteVerticalsSuggestionSearch fetches suggestions from the verticals API endpoint.

## Usage

```jsx
import SiteVerticalsSuggestionSearch from 'calypso/components/site-verticals-suggestion-search';

function onChange( { vertical_name, vertical_slug, vertical_id } ) {
	console.log( 'New vertical values: ', vertical_name, vertical_slug, vertical_id );
}

function render() {
	return (
		<SiteVerticalsSuggestionSearch
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus
			onChange={ onChange }
			searchValue={ stateValue }
		/>
	);
}
```

## Props

### _(String)_ `searchValue`

The value with which we conduct a vertical API search, and also the initial search field value to display when the component loads.

### _(String)_ `placeholder`

_Optional_ placeholder text for the search input field. Default: `''`

### _(Function)_ `onChange`

The callback function for receiving updated value.

Returns _{object}_:

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

### _(Boolean)_ `showPopular`

_Optional_ Informs the component whether to show a list of popular vertical topics when the input field is empty. Default: `false`

### _(Boolean)_ `autoFocus`

_Optional_ When set to `true` gives immediate focus to the search input field. Default: `false`
