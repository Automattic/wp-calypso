# pagination-control

This component returns a `ul` of dots used to navigate between slides, pages, or steps. The color is inherited from the WP-admin theme color.

## Usage

```jsx
import { PaginationControl } from '@automattic/components';
import { Button } from '@wordpress/components';


function MyComponent( {
	pageIndex,
	numberOfPages,
	onChange,
	onPreviousStepProgression,
	onNextStepProgression,
} ) {
	return (
		<PaginationControl
			activePageIndex={ pageIndex }
			numberOfPages={ numberOfPages }
			onChange={ onChange }
			classNames={ [ 'my-controls', 'custom-pagination' ] }
		>
			<div className='my-controls__example-children'>
				<Button onClick={ onPreviousStepProgression }>Back</Button>
				<Button onClick={ onNextStepProgression }>Next</Button>
			</div>
		</PaginationControl>
	);
}
```

## Props

| Name             | Type            | Required | Description                                                                   |
| ---------------- | --------------- | -------- | ----------------------------------------------------------------------------- |
| `activePageIndex`| `number`        | yes      | Index of the current page/step the user is viewing                            |
| `numberOfPages`  | `number`        | yes      | Total number of pages/steps available                                         |
| `onChange`       | `function`      | yes      | Callback to run when the dots are clicked. The *index* is being passed as an argument. This should have no return |
| `classNames`     | `string\|array` | optional | List of classes you wish to apply to the controls                             |
| `children`       | `element`	     | optional | An element to append to the end the dots, for example Prev/Next buttons. This will be aligned right |
