# Swipeable

This component is used to add horizontal swipe controls to a list of elements (pages).

## Example Usage

```js
import Swipeable from 'calypso/components/swipeable';

function Pager() {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	return (
		<Swipeable
			onPageSelect={ ( index ) => {
				setCurrentPage( index );
			} }
			currentPage={ 1 }
			pageClassName="example-page-component-class"
		>
			<div>Page 1</div>
			<div>Page 2</div>
			<div>Page 3</div>
		</Swipeable>
	);
}
```

## Props

- `onPageSelect` - (function) Function that runs when the page is selected on using a swipe. Useful for updating the current page.
- `pageClassName` - _optional_ (string) Optional class attrbitue of the page component. Useful for styling. 
- `currentPage` - (int) Index of the currently selected/shown page.
- `hasDynamicHeight` - (bool) Whether height should be changed dynamically.
