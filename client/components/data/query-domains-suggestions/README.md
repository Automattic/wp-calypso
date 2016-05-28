Query Domains Suggestions
===========================

`<QueryDomainsSuggestions />` is a React component used in managing network requests for domains/suggestions.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';

export default function defaultSuggestions() {
	return (
		<div>
			<QueryDomainsSuggestions
				query="mycoolname"
				quantity={ 2 }
				vendor="domainsbot"
				includeSubdomain={ false } />
		</div>
	);
}
```

## Props

### `query`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The query we use when searching for domains suggestions. 

### `vendor`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

Specifies which vendor we should use when searching for domains suggestions.

### `quantity`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The maximum number of suggestions to return.

### `includeSubdomain`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

(Default false) When true, includes *.wordpress.com suggestions.