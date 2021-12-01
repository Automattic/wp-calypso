import classnames from 'classnames';
import { Children, useState, useEffect, useRef } from 'react';

import './style.scss';

export const Swipeable = ( {
	hasDynamicHeight = false,
	children,
	currentPage = 0,
	onPageSelect,
	pageClassName,
} ) => {
	const [ isDragging, setIsDragging ] = useState( false );
	const [ pageWidth, setPageWidth ] = useState();

	const [ pagesStyle, setPagesStyle ] = useState( {
		transform: `translate3d(0px, 0px, 0px)`,
		transitionDuration: `300ms`,
	} );
	const [ dragStartData, setDragStartData ] = useState( {} );

	const pagesRef = useRef();
	const resizeObserverRef = useRef();
	const numPages = Children.count( children );

	const getWidth = () => {
		return resizeObserverRef.current?.getBoundingClientRect().width;
	};

	const getPagesWidth = () => {
		return pageWidth * numPages;
	};

	const getOffset = ( index ) => {
		return -( pageWidth * index );
	};

	function useUpdateLayout( enabled, currentPageIndex, updateLayout ) {
		// save callback to a ref so that it doesn't need to be a dependency of other hooks
		const savedUpdateLayout = useRef();
		useEffect( () => {
			savedUpdateLayout.current = updateLayout;
		}, [ updateLayout ] );

		// fire when the `currentPageIndex` parameter changes
		useEffect( () => {
			if ( ! enabled ) {
				return;
			}

			savedUpdateLayout.current();
		}, [ enabled, currentPageIndex ] );

		// fire when the window resizes
		useEffect( () => {
			if ( ! enabled ) {
				return;
			}

			const onResize = () => savedUpdateLayout.current( false );
			window.addEventListener( 'resize', onResize );
			window.addEventListener( 'orientationchange', onResize );
			return () => {
				window.removeEventListener( 'resize', onResize );
				window.removeEventListener( 'orientationchange', onResize );
			};
		}, [ enabled ] );
	}

	const updateEnabled = hasDynamicHeight && numPages > 1;

	useUpdateLayout( updateEnabled, currentPage, ( hasTransitionDuration = true ) => {
		const offset = getOffset( currentPage );
		const transform = {
			transform: `translate3d(${ offset }px, 0px, 0px)`,
			transitionDuration: hasTransitionDuration ? `300ms` : `0ms`,
		};

		let height = { height: null };
		const targetHeight = pagesRef.current?.querySelector( '.is-current' )?.offsetHeight;

		if ( targetHeight && pagesStyle?.height !== targetHeight ) {
			height = { height: null };
		}

		setPageWidth( getWidth() );

		setPagesStyle( { ...pagesStyle, ...height, ...transform } );
	} );

	useEffect( () => {
		if ( currentPage >= numPages ) {
			onPageSelect( numPages - 1 );
		}
	}, [ numPages, currentPage, onPageSelect ] );

	const getDragPosition = ( event ) => {
		if ( event.hasOwnProperty( 'clientX' ) ) {
			return { x: event.clientX, y: event.clientY };
		}

		if ( event.targetTouches[ 0 ] ) {
			return { x: event.targetTouches[ 0 ].clientX, y: event.targetTouches[ 0 ].clientY };
		}

		const touch = event.changedTouches[ 0 ];
		return { x: touch.clientX, y: touch.clientY };
	};

	const handleDragStart = ( event ) => {
		const position = getDragPosition( event );
		setDragStartData( position );
		setPagesStyle( { ...pagesStyle, transitionDuration: `0ms` } ); // Set transition Duration to 0 for smooth dragging.
		setIsDragging( true );
	};

	const handleDragEnd = ( event ) => {
		if ( ! isDragging ) {
			return; // End early if we are not dragging any more.
		}

		const THRESHOLD_OFFSET = 100; // Number of pixels to travel before we trigger the slider to move to the desired slide.
		const dragPosition = getDragPosition( event );
		const delta = dragPosition.x - dragStartData.x;

		const hasMetThreshold = Math.abs( delta ) > THRESHOLD_OFFSET;

		let newIndex = currentPage;
		if ( delta < 0 && hasMetThreshold && numPages !== currentPage + 1 ) {
			newIndex = currentPage + 1;
		}

		if ( delta > 0 && hasMetThreshold && currentPage !== 0 ) {
			newIndex = currentPage - 1;
		}
		const offset = getOffset( newIndex );
		setPagesStyle( {
			transform: `translate3d(${ offset }px, 0px, 0px)`,
			transitionDuration: `300ms`,
		} );
		onPageSelect( newIndex );
		setDragStartData( {} );
		setIsDragging( false );
	};

	const handleDrag = ( event ) => {
		if ( ! isDragging ) {
			return;
		}
		const dragPosition = getDragPosition( event );
		const delta = dragPosition.x - dragStartData.x;

		const offset = getOffset( currentPage ) + delta;

		// Allow for swipe left or right
		if ( ( numPages !== currentPage + 1 && delta < 0 ) || ( currentPage !== 0 && delta > 0 ) ) {
			setPagesStyle( {
				...pagesStyle,
				transform: `translate3d(${ offset }px, 0px, 0px)`,
				transitionDuration: `0ms`,
			} );
		}

		const swipeableArea = pagesRef.current?.getBoundingClientRect();
		if ( ! swipeableArea ) {
			return;
		}

		// Did the user swipe out of the swipable area?
		if (
			dragPosition.x < swipeableArea.left ||
			dragPosition.x > swipeableArea.right ||
			dragPosition.y > swipeableArea.bottom ||
			dragPosition.y < swipeableArea.top
		) {
			handleDragEnd( event );
		}
	};

	return (
		<div>
			<div
				className="swipeable__container"
				onDragStart={ handleDragStart }
				onPointerDown={ handleDragStart }
				onDrag={ handleDrag }
				onPointerMove={ handleDrag }
				onDragEnd={ handleDragEnd }
				onPointerUp={ handleDragEnd }
				onDragLeave={ handleDragEnd }
				onPointerCancel={ handleDragEnd }
				ref={ pagesRef }
			>
				<div className="swipeable__pages" style={ { ...pagesStyle, width: getPagesWidth() } }>
					{ Children.map( children, ( child, index ) => (
						<div
							style={ { width: `${ pageWidth }px` } } // Setting the page width is important for iOS browser.
							className={ classnames( 'swipeable__page', pageClassName, {
								'is-current': index === currentPage,
								'is-prev': index < currentPage,
								'is-next': index > currentPage,
							} ) }
							key={ `page-${ index }` }
						>
							{ child }
						</div>
					) ) }
				</div>
			</div>
			<div ref={ resizeObserverRef } className="swipeable__resize-observer"></div>
		</div>
	);
};

export default Swipeable;
