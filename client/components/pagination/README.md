# Pagination

Use pagination to allow navigation between pages that represent an ordered collection of items.

## Usage

```js
import Pagination from 'calypso/components/pagination';

function render() {
	return <Pagination />;
}
```

### Props

| Name          | Type       | Default | Description                                                                                      |
| ------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------ |
| `page`\*      | `integer`  | null    | The current active page number.                                                                  |
| `perPage`\*   | `integer`  | null    | Number of records shown per page.                                                                |
| `total`\*     | `integer`  | null    | Total number of records.                                                                         |
| `pageClick`\* | `function` | null    | Function called when a pagination item is clicked - the page clicked is provided as an argument. |
| `compact`     | `bool`     | false   | Render a smaller version.                                                                        |
| `nextLabel`   | `string`   | null    | Overrides the "Next" button label.                                                               |
| `prevLabel`   | `string`   | null    | Overrides the "Previous" button label.                                                           |

### General guidelines

- Use pagination at the bottom of lists.
- Use infinite scrolling for consuming/scanning content. Use pagination for managing large lists.

## Related components

- To group buttons together, use the [ButtonGroup](./button-group) component.
- To use show/hide certain content, use the [SegmentedControl](./segmented-control) component.
