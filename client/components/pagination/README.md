Stats Pagination
===

This component provides a way to paginate a resultset.

## Usage

```js
import Pagination from 'components/pagination';

render: function() {
	return (
		<Pagination compact={ <Boolean> } page={ <Number> } perPage={ <Number> } total={ <Number> } pageClick={ <Function> } />;
	);
}
```

### Props

Name | Type | Default | Description
---- | ---- | ---- | ----
`page` | `integer` | null | The current active page number.
`perPage` | `integer` | null | Number of records shown per page.
`total` | `integer` | null | Total number of records.
`pageClick` | `function` | null | Function called when a pagination item is clicked - the page clicked is provided as an argument.
`compact` | `bool` | false | (Optional) Render a smaller version.
`nextLabel` | `string` | null | (Optional) Overrides the "Next" button label.
`prevLabel` | `string` | null | (Optional) Overrides the "Previous" button label.
