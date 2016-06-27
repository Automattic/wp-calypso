TermTreeSelector
============

The `TermTreeSelector` component renders a hierarchical list of Terms with corresponding form actions (radio or checkboxes) and a search box for filtering.

Under the hood, it uses [`<QueryTerms />`](../../components/data/query-terms) to ensure that the requested term data is always made available to the global application terms state.

## Usage

```jsx
import TermSelector from 'my-sites/term-tree-selector';

<TermTreeSelector siteId={ this.props.siteId } taxonomy="category" />
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which terms should be queried.

### `taxonomy`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"category"</code></td></tr>
</table>

The type of taxonomy to query.

### `multiple`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>false</code></td></tr>
</table>

Whether the results should allow multiple selection (checkbox input) or single selection (radio input).

### `onChange`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>() => {}</code></td></tr>
</table>

A function to invoke when the selected value has changed. The function will be passed the selected term item as the first argument, and the [change event object](https://developer.mozilla.org/en-US/docs/Web/Events/change) as the second argument.

### `selected`

<table>
	<tr><th>Type</th><td>Array</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Array of selected term IDs.

### `emptyMessage`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

A message to be shown if no terms are found.

### `createLink`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

A link to be shown if the search results in no found terms.

### `analyticsPrefix`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"Category Selector"</code></td></tr>
</table>

The prefix to be used when recording search events in Google Analytics

### `className`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

An optional classname to apply to the term selector wrapping element.
