import classnames from 'classnames';
import { useRtl } from 'i18n-calypso';
import { Children, useState, useEffect, useRef, useCallback } from 'react';

import './style.scss';

const OFFSET_THRESHOLD_PERCENTAGE = 0.45; // Percentage of width to travel before we trigger the slider to move to the desired slide.
const VELOCITY_THRESHOLD = 0.5; // Speed of drag above, before we trigger the slider to move to the desired slide.

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

function getDragPositionAndTime( event ) {
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
}

function getPagesWidth( pageWidth, numPages ) {
	if ( ! pageWidth ) {
		return null;
	}
	return pageWidth * numPages;
}

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

	const getOffset = useCallback(
		( index ) => {
			const offset = pageWidth * index;
			return isRtl ? offset : -offset;
		},
		[ isRtl, pageWidth ]
	);

	const updateEnabled = hasDynamicHeight && numPages > 1;

	useUpdateLayout( updateEnabled, currentPage, ( hasTransitionDuration = true ) => {
		const offset = getOffset( currentPage );
		const transform = {
			transform: `translate3d(${ offset }px, 0px, 0px)`,
			transitionDuration: hasTransitionDuration ? `300ms` : `0ms`,
		};
		let height = {};
		const targetHeight = pagesRef.current?.querySelector( '.is-current' )?.offsetHeight;
		if ( targetHeight && pagesStyle?.height !== targetHeight ) {
			height = { height: targetHeight };
		}
		setPageWidth( resizeObserverRef.current?.getBoundingClientRect().width );
		setSwipeableArea( pagesRef.current?.getBoundingClientRect() );
		setPagesStyle( { ...pagesStyle, ...height, ...transform } );
	} );

	const handleDragStart = useCallback(
		( event ) => {
			const position = getDragPositionAndTime( event );
			setSwipeableArea( pagesRef.current?.getBoundingClientRect() );
			setDragStartData( position );
			setPageWidth( resizeObserverRef.current?.getBoundingClientRect().width );
			setPagesStyle( { ...pagesStyle, transitionDuration: `0ms` } ); // Set transition Duration to 0 for smooth dragging.
		},
		[ pagesStyle ]
	);

	const hasSwipedToNextPage = useCallback( ( delta ) => ( isRtl ? delta > 0 : delta < 0 ), [
		isRtl,
	] );
	const hasSwipedToPreviousPage = useCallback( ( delta ) => ( isRtl ? delta < 0 : delta > 0 ), [
		isRtl,
	] );

	const handleDragEnd = useCallback(
		( event ) => {
			if ( ! dragStartData ) {
				return; // End early if we are not dragging any more.
			}

			const dragPosition = getDragPositionAndTime( event );
			const delta = dragPosition.x - dragStartData.x;
			const absoluteDelta = Math.abs( delta );
			const velocity = absoluteDelta / ( dragPosition.timeStamp - dragStartData.timeStamp );

			const hasMetThreshold =
				absoluteDelta > OFFSET_THRESHOLD_PERCENTAGE * pageWidth || velocity > VELOCITY_THRESHOLD;

			let newIndex = currentPage;
			if ( hasSwipedToNextPage( delta ) && hasMetThreshold && numPages !== currentPage + 1 ) {
				newIndex = currentPage + 1;
			}

			if ( hasSwipedToPreviousPage( delta ) && hasMetThreshold && currentPage !== 0 ) {
				newIndex = currentPage - 1;
			}
			const offset = getOffset( newIndex );
			setPagesStyle( {
				...pagesStyle,
				transform: `translate3d(${ offset }px, 0px, 0px)`,
				transitionDuration: `300ms`,
			} );
			onPageSelect( newIndex );
			setDragStartData( null );
		},
		[
			currentPage,
			dragStartData,
			getOffset,
			hasSwipedToNextPage,
			hasSwipedToPreviousPage,
			numPages,
			onPageSelect,
			pagesStyle,
			pageWidth,
		]
	);

	const handleDrag = useCallback(
		( event ) => {
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
		},
		[
			dragStartData,
			getOffset,
			currentPage,
			numPages,
			hasSwipedToNextPage,
			hasSwipedToPreviousPage,
			swipeableArea,
			pagesStyle,
			handleDragEnd,
		]
	);

	const getTouchEvents = useCallback( () => {
		if ( 'onpointerup' in document ) {
			return {
				onPointerDown: handleDragStart,
				onPointerMove: handleDrag,
				onPointerUp: handleDragEnd,
				onPointerCancel: handleDragEnd,
				onPointerLeave: handleDragEnd,
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
	}, [ handleDragStart, handleDrag, handleDragEnd ] );

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
					style={ { ...pagesStyle, width: getPagesWidth( pageWidth, numPages ) } }
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
