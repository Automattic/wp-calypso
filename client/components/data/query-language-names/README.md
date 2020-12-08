# Query Language Names

`<QueryLanguageNames />` is a React component that manages requests to get an object of localized language names and their autonym/English equivalents.

## Usage

Render the component without props. It does not accept any children or render any elements to the page.

```jsx
import QueryLanguageNames from 'calypso/components/data/query-language-names';

export default function () {
	return (
		<div>
			<QueryLanguageNames />
		</div>
	);
}
```
