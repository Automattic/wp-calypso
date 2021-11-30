# Support Info

This component is used to add horizontal swipe controls to a list of elements (pages).

## Example Usage

```js
import Swipable from 'calypso/components/swipable';

function Pager() {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	return ( 
		<Swipable onPageSelect={ (index) => { setCurrentPage( index ) } } currentPage pageClassName="" >
			<div>Page 1</div>
			<div>Page 2</div>
			<div>Page 3</div>
		</Swipable>
	);
}
```

## Props

- `onPageSelect` - (function) Function that .
- `pageClassName` - _optional_ (string) A URL leading to an overview of a feature. If `false`, no link will be displayed.
- `currentPage` - (int) Index of a selected page.
- `hasDynamicHeight` - (bool) should height by dynamically changed.
