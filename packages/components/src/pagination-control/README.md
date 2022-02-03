# pagination-control

This component returns a `ul` of dots used to navigate between slides, pages, or steps. The color is inherited from the WP-admin theme color.

## Usage

```jsx
import { PaginationControl } from '@automattic/components';

function MyComponent() {
	return (
		<PaginationControl
			activePageIndex={ pageIndex }
			numberOfPages={ numberOfPages }
			onChange={ onChange }
			classes={ [ 'my-controls', 'custom-pagination' ] }
		>
			// Example child element for added buttons
			<div className='example-children'>
				<button onClick={ previousCallback }>Previous</button>
				<button onClick={ nextCallback }>Next</button>
			</div>
		</PaginationControl>
	);
}
```

## Props

| Name             | Type            | Required | Description                                                                   |
| ---------------- | --------------- | -------- | ----------------------------------------------------------------------------- |
| `activePageIndex`      | `number`        | yes      | Index of the current page/step the user is viewing                            |
| `numberOfPages`  | `number`        | yes      | Total number of pages/steps available                                         |
| `onChange`       | `function`      | yes      | Callback to run when the dots are clicked. The *index* is being passed as an argument. This should have no return |
| `classes`        | `string\|array` | optional | List of classes you wish to apply to the controls                             |
| `children`       | `element`	     | optional | An element to append to the end the dots, for example Prev/Next buttons. This will be aligned right |
