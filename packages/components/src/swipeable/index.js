import clsx from 'clsx';
import { useRtl } from 'i18n-calypso';
import { Children, useState, useLayoutEffect, useRef, useCallback } from 'react';

import './style.scss';

const OFFSET_THRESHOLD_PERCENTAGE = 0.35; // Percentage of width to travel before we trigger the slider to move to the desired slide.
const VELOCITY_THRESHOLD = 0.2; // Speed of drag above, before we trigger the slider to move to the desired slide.
const VERTICAL_THRESHOLD_ANGLE = 55;
const TRANSITION_DURATION = '300ms';

function useResizeObserver() {
	const [ observerEntry, setObserverEntry ] = useState( {} );
	const [ node, setNode ] = useState( null );
	const observer = useRef( null );

	const disconnect = useCallback( () => observer.current?.disconnect(), [] );

	const observe = useCallback( () => {
		observer.current = new ResizeObserver( ( [ entry ] ) => setObserverEntry( entry ) );
		if ( node ) {
			observer.current.observe( node );
		}
	}, [ node ] );

	useLayoutEffect( () => {
		observe();
		return () => disconnect();
	}, [ disconnect, observe ] );

	return [ setNode, observerEntry ];
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
	isClickEnabled,
	...otherProps
} ) => {
	const [ swipeableArea, setSwipeableArea ] = useState();
	const isRtl = useRtl();

	const [ resizeObserverRef, entry ] = useResizeObserver();

	const [ pagesStyle, setPagesStyle ] = useState( {
		transitionDuration: TRANSITION_DURATION,
	} );

	const [ dragData, setDragData ] = useState( null );

	const pagesRef = useRef();
	const numPages = Children.count( children );
	const containerWidth = entry?.contentRect?.width;

	const getOffset = useCallback(
		( index ) => {
			const offset = containerWidth * index;
			return isRtl ? offset : -offset;
		},
		[ isRtl, containerWidth ]
	);

	const updateEnabled = hasDynamicHeight && numPages > 1;

	// Generate a property that denotes the order of the cards, in order to recalculate height whenever the card order changes.
	const childrenOrder = children.reduce( ( acc, child ) => acc + child.key, '' );

	useLayoutEffect( () => {
		if ( ! updateEnabled ) {
			// This is a fix for a bug when you have >1 pages and it update the component to just one but the height is still
			// Related to https://github.com/Automattic/dotcom-forge/issues/2033
			if ( pagesStyle?.height ) {
				setPagesStyle( { ...pagesStyle, height: undefined } );
			}
			return;
		}
		const targetHeight = pagesRef.current?.querySelector( '.is-current' )?.offsetHeight;

		if ( targetHeight && pagesStyle?.height !== targetHeight ) {
			setPagesStyle( { ...pagesStyle, height: targetHeight } );
		}
	}, [ pagesRef, currentPage, pagesStyle, updateEnabled, containerWidth, childrenOrder ] );

	const resetDragData = useCallback( () => {
		delete pagesStyle.transform;
		setPagesStyle( {
			...pagesStyle,
			transitionDuration: TRANSITION_DURATION,
		} );
		setDragData( null );
	}, [ pagesStyle, setPagesStyle, setDragData ] );

	const handleDragStart = useCallback(
		( event ) => {
			const position = getDragPositionAndTime( event );
			setSwipeableArea( pagesRef.current?.getBoundingClientRect() );
			setDragData( { start: position } );
			setPagesStyle( { ...pagesStyle, transitionDuration: `0ms` } ); // Set transition Duration to 0 for smooth dragging.
		},
		[ pagesStyle ]
	);

	const hasSwipedToNextPage = useCallback(
		( delta ) => ( isRtl ? delta > 0 : delta < 0 ),
		[ isRtl ]
	);
	const hasSwipedToPreviousPage = useCallback(
		( delta ) => ( isRtl ? delta < 0 : delta > 0 ),
		[ isRtl ]
	);

	const handleDragEnd = useCallback(
		( event ) => {
			if ( ! dragData ) {
				return; // End early if we are not dragging any more.
			}

			let dragPosition = getDragPositionAndTime( event );

			if ( dragPosition.x === 0 ) {
				dragPosition = dragData.last;
			}

			const delta = dragPosition.x - dragData.start.x;
			const absoluteDelta = Math.abs( delta );
			const velocity = absoluteDelta / ( dragPosition.timeStamp - dragData.start.timeStamp );

			const verticalAbsoluteDelta = Math.abs( dragPosition.y - dragData.start.y );
			const angle = ( Math.atan2( verticalAbsoluteDelta, absoluteDelta ) * 180 ) / Math.PI;

			// Is click or tap?
			if ( velocity === 0 && isClickEnabled ) {
				if ( numPages !== currentPage + 1 ) {
					onPageSelect( currentPage + 1 );
				} else {
					onPageSelect( 0 );
				}
				resetDragData();
				return;
			}

			// Is vertical scroll detected?
			if ( angle > VERTICAL_THRESHOLD_ANGLE ) {
				resetDragData();
				return;
			}

			const hasMetThreshold =
				absoluteDelta > OFFSET_THRESHOLD_PERCENTAGE * containerWidth ||
				velocity > VELOCITY_THRESHOLD;

			let newIndex = currentPage;
			if ( hasSwipedToNextPage( delta ) && hasMetThreshold && numPages !== currentPage + 1 ) {
				newIndex = currentPage + 1;
			}

			if ( hasSwipedToPreviousPage( delta ) && hasMetThreshold && currentPage !== 0 ) {
				newIndex = currentPage - 1;
			}

			delete pagesStyle.transform;

			setPagesStyle( {
				...pagesStyle,
				transitionDuration: TRANSITION_DURATION,
			} );
			onPageSelect( newIndex );
			setDragData( null );
		},
		[
			currentPage,
			dragData,
			hasSwipedToNextPage,
			hasSwipedToPreviousPage,
			numPages,
			onPageSelect,
			pagesStyle,
			containerWidth,
			isClickEnabled,
		]
	);

	const handleDrag = useCallback(
		( event ) => {
			if ( ! dragData ) {
				return;
			}

			const dragPosition = getDragPositionAndTime( event );
			const delta = dragPosition.x - dragData.start.x;
			const absoluteDelta = Math.abs( delta );
			const offset = getOffset( currentPage ) + delta;
			setDragData( { ...dragData, last: dragPosition } );
			// The user needs to swipe horizontally more then 2 px in order for the canvase to be dragging.
			// We do this so that the user can scroll vertically smother.
			if ( absoluteDelta < 3 ) {
				return;
			}

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
			dragData,
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

	const offset = getOffset( currentPage );

	return (
		<>
			<div
				{ ...getTouchEvents() }
				className="swipeable__container"
				ref={ pagesRef }
				{ ...otherProps }
			>
				<div
					className={ clsx( 'swipeable__pages', containerClassName ) }
					style={ {
						transform: `translate3d(${ offset }px, 0px, 0px)`,
						...pagesStyle,
						width: getPagesWidth( containerWidth, numPages ),
					} }
				>
					{ Children.map( children, ( child, index ) => (
						<div
							style={ { width: `${ containerWidth }px` } } // Setting the page width is important for iOS browser.
							className={ clsx( 'swipeable__page', pageClassName, {
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
