import classnames from 'classnames';
import { useRtl } from 'i18n-calypso';
import { Children, useState, useEffect, useRef } from 'react';

import './style.scss';

const OFFSET_THRESHOLD = 100; // Number of pixels to travel before we trigger the slider to move to the desired slide.
const VELOCITY_THRESHOLD = 0.5; // Speed of drag above, before we trigger the slider to move to the desired slide.

export const Swipeable = ( {
	hasDynamicHeight = false,
	children,
	currentPage = 0,
	onPageSelect,
	pageClassName,
	containerClassName,
	...otherProps
} ) => {
	const [ pageWidth, setPageWidth ] = useState( null );
	const [ swipeableArea, setSwipeableArea ] = useState();
	const isRtl = useRtl();

	const [ pagesStyle, setPagesStyle ] = useState( {
		transform: `translate3d(0px, 0px, 0px)`,
		transitionDuration: `300ms`,
	} );
	const [ dragStartData, setDragStartData ] = useState( null );

	const pagesRef = useRef();
	const resizeObserverRef = useRef();
	const numPages = Children.count( children );

	const getWidth = () => {
		return resizeObserverRef.current?.getBoundingClientRect().width;
	};

	const getPagesWidth = () => {
		if ( ! pageWidth ) {
			return null;
		}
		return pageWidth * numPages;
	};

	const getOffset = ( index ) => {
		const offset = pageWidth * index;
		return isRtl ? offset : -offset;
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
		setSwipeableArea( pagesRef.current?.getBoundingClientRect() );
		setPagesStyle( { ...pagesStyle, ...height, ...transform } );
	} );

	useEffect( () => {
		if ( currentPage >= numPages ) {
			onPageSelect( numPages - 1 );
		}
	}, [ numPages, currentPage, onPageSelect ] );

	const getDragPositionAndTime = ( event ) => {
		const { timeStamp } = event;
		if ( event.hasOwnProperty( 'clientX' ) ) {
			return { x: event.clientX, y: event.clientY, timeStamp };
		}

		if ( event.targetTouches[ 0 ] ) {
			return {
				x: event.targetTouches[ 0 ].clientX,
				y: event.targetTouches[ 0 ].clientY,
				timeStamp,
			};
		}

		const touch = event.changedTouches[ 0 ];
		return { x: touch.clientX, y: touch.clientY, timeStamp };
	};

	const handleDragStart = ( event ) => {
		const position = getDragPositionAndTime( event );
		setDragStartData( position );
		setPagesStyle( { ...pagesStyle, transitionDuration: `0ms` } ); // Set transition Duration to 0 for smooth dragging.
	};

	const hasSwipedToNextPage = ( delta ) => ( isRtl ? delta > 0 : delta < 0 );
	const hasSwipedToPreviousPage = ( delta ) => ( isRtl ? delta < 0 : delta > 0 );

	const handleDragEnd = ( event ) => {
		if ( ! dragStartData ) {
			return; // End early if we are not dragging any more.
		}

		const dragPosition = getDragPositionAndTime( event );
		const delta = dragPosition.x - dragStartData.x;
		const absoluteDelta = Math.abs( delta );
		const velocity = absoluteDelta / ( dragPosition.timeStamp - dragStartData.timeStamp );

		const hasMetThreshold = absoluteDelta > OFFSET_THRESHOLD || velocity > VELOCITY_THRESHOLD;

		let newIndex = currentPage;
		if ( hasSwipedToNextPage( delta ) && hasMetThreshold && numPages !== currentPage + 1 ) {
			newIndex = currentPage + 1;
		}

		if ( hasSwipedToPreviousPage( delta ) && hasMetThreshold && currentPage !== 0 ) {
			newIndex = currentPage - 1;
		}
		const offset = getOffset( newIndex );
		setPagesStyle( {
			transform: `translate3d(${ offset }px, 0px, 0px)`,
			transitionDuration: `300ms`,
		} );
		onPageSelect( newIndex );
		setDragStartData( null );
	};

	const handleDrag = ( event ) => {
		if ( ! dragStartData ) {
			return;
		}
		const dragPosition = getDragPositionAndTime( event );
		const delta = dragPosition.x - dragStartData.x;

		const offset = getOffset( currentPage ) + delta;

		// Allow for swipe left or right
		if (
			( numPages !== currentPage + 1 && hasSwipedToNextPage( delta ) ) ||
			( currentPage !== 0 && hasSwipedToPreviousPage( delta ) )
		) {
			setPagesStyle( {
				...pagesStyle,
				transform: `translate3d(${ offset }px, 0px, 0px)`,
				transitionDuration: `0ms`,
			} );
		}

		if ( ! swipeableArea ) {
			return;
		}

		// Did the user swipe out of the swipeable area?
		if (
			dragPosition.x < swipeableArea.left ||
			dragPosition.x > swipeableArea.right ||
			dragPosition.y > swipeableArea.bottom ||
			dragPosition.y < swipeableArea.top
		) {
			handleDragEnd( event );
		}
	};

	const getTouchEvents = () => {
		if ( 'onpointerup' in document ) {
			return {
				onPointerDown: handleDragStart,
				onPointerMove: handleDrag,
				onPointerUp: handleDragEnd,
				onPointerCancel: handleDragEnd,
			};
		}

		if ( 'ondragend' in document ) {
			return {
				onDragStart: handleDragStart,
				onDrag: handleDrag,
				onDragEnd: handleDragEnd,
				onDragExit: handleDragEnd,
			};
		}

		if ( 'ontouchend' in document ) {
			return {
				onTouchStart: handleDragStart,
				onTouchMove: handleDrag,
				onTouchEnd: handleDragEnd,
				onTouchCancel: handleDragEnd,
			};
		}

		return null;
	};

	return (
		<>
			<div
				{ ...getTouchEvents() }
				className="swipeable__container"
				ref={ pagesRef }
				{ ...otherProps }
			>
				<div
					className={ classnames( 'swipeable__pages', containerClassName ) }
					style={ { ...pagesStyle, width: getPagesWidth() } }
				>
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
		</>
	);
};

export default Swipeable;
