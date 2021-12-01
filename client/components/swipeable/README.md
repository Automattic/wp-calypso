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
			currentPage
			pageClassName=""
		>
			<div>Page 1</div>
			<div>Page 2</div>
			<div>Page 3</div>
		</Swipeable>
	);
}
```

## Props

- `onPageSelect` - (function) Function that .
- `pageClassName` - _optional_ (string) A URL leading to an overview of a feature. If `false`, no link will be displayed.
- `currentPage` - (int) Index of a selected page.
- `hasDynamicHeight` - (bool) Whether height should be changed dynamically
