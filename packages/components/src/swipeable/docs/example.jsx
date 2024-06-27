import { useState } from 'react';
import Swipeable from '../index';

const SwipeableExample = () => {
	const [ currentPage, setCurrentPage ] = useState( 0 );

	return (
		<Swipeable
			onPageSelect={ ( index ) => {
				setCurrentPage( index );
			} }
			currentPage={ currentPage }
			pageClassName="example-page-component-class"
			hasDynamicHeight
		>
			<div>Page 1 - Swipe Left</div>
			<div>Page 2 - Swipe Left or Right</div>
			<div>Page 3 - Swipe Right</div>
		</Swipeable>
	);
};

SwipeableExample.displayName = 'Swipeable';
export default SwipeableExample;
