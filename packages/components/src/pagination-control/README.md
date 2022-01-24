# pagination-control

This component returns a `ul` of dots used to navigate between slides, pages, or steps. The color is inherited from the WP-admin theme color.

## Usage

```jsx
import { PaginationControl } from '@automattic/components';

return (
	<PaginationControl
		currentPage={ currentPage }
		numberOfPages={ numberOfPages }
		setCurrentPage={ setCurrentPage }
		classes={ [ 'my-controls', 'custom-pagination' ] }
	/>
);
```

### Props

| Name             | Type           | Required | Description                                                                        |
| ---------------- | -------------- | -------- | ---------------------------------------------------------------------------------- |
| `currentPage`    | `number`       | yes      | Index of the current page/step the user is viewing                                 |
| `numberOfPages`  | `number`       | yes      | Total number of pages/steps available                                              |
| `setCurrentPage` | `function`     | yes      | Callback to run when changing between pages/steps. This should have no return      |
| `classes`        | `string\|array` | optional | List of classes you widh to apply to the controls in either CSV or array           |
