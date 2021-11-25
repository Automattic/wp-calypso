import { Icon, arrowRight } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate, useRtl } from 'i18n-calypso';
import { times } from 'lodash';
import { Children, useState, useEffect, useRef } from 'react';

import './style.scss';

const Controls = ( { showControlLabels = false, currentPage, numberOfPages, setCurrentPage } ) => {
	const translate = useTranslate();
	const isRtl = useRtl();
	if ( numberOfPages < 2 ) {
		return null;
	}
	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < numberOfPages - 1;
	return (
		<ul className="dot-pager__controls" aria-label={ translate( 'Pager controls' ) }>
			{ times( numberOfPages, ( page ) => (
				<li key={ `page-${ page }` } aria-current={ page === currentPage ? 'page' : undefined }>
					<button
						key={ page.toString() }
						className={ classnames( 'dot-pager__control-choose-page', {
							'dot-pager__control-current': page === currentPage,
						} ) }
						disabled={ page === currentPage }
						aria-label={ translate( 'Page %(page)d of %(numberOfPages)d', {
							args: { page: page + 1, numberOfPages },
						} ) }
						onClick={ () => setCurrentPage( page ) }
					/>
				</li>
			) ) }
			<li key="dot-pager-prev" className="dot-pager__control-gap">
				<button
					className="dot-pager__control-prev"
					disabled={ ! canGoBack }
					aria-label={ translate( 'Previous' ) }
					onClick={ () => setCurrentPage( currentPage - 1 ) }
				>
					{ /* The arrowLeft icon isn't as bold as arrowRight, so using the same icon and flipping to make sure they match */ }
					<Icon
						icon={ arrowRight }
						size={ 18 }
						fill="currentColor"
						style={
							/* Flip the icon for languages with LTR direction. */
							! isRtl ? { transform: 'scaleX(-1)' } : null
						}
					/>
					{ showControlLabels && translate( 'Previous' ) }
				</button>
			</li>
			<li key="dot-pager-next">
				<button
					className="dot-pager__control-next"
					disabled={ ! canGoForward }
					aria-label={ translate( 'Next' ) }
					onClick={ () => setCurrentPage( currentPage + 1 ) }
				>
					{ showControlLabels && translate( 'Next' ) }
					<Icon
						icon={ arrowRight }
						size={ 18 }
						fill="currentColor"
						style={
							/* Flip the icon for languages with RTL direction. */
							isRtl ? { transform: 'scaleX(-1)' } : null
						}
					/>
				</button>
			</li>
		</ul>
	);
};

export const DotPager = ( {
	showControlLabels = false,
	hasDynamicHeight = false,
	children,
	className,
	onPageSelected,
	...props
} ) => {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	const [ isDragging, setIsDragging ] = useState( false );

	const [ pagesStyle, setPagesStyle ] = useState( {
		transform: `translate3d(0px, 0px, 0px)`,
		transitionDuration: `300ms`,
	} );
	const [ dragStartData, setDragStartData ] = useState( {} );

	const pagesRef = useRef();
	const numPages = Children.count( children );

		const targetHeight = pagesRef.current?.querySelector( '.is-current' )?.offsetHeight;
		if ( targetHeight && pagesStyle?.height !== targetHeight ) {
			setPagesStyle( { ...pagesStyle, height: targetHeight } );
		}
	}, [ hasDynamicHeight, setPagesStyle, pagesStyle ] );

	useEffect( () => {
		updateLayout();
	}, [ currentPage, updateLayout, pagesStyle ] );

			savedUpdateLayout.current();
		}, [ enabled, currentPageIndex ] );

		// fire when the window resizes
		useEffect( () => {
			if ( ! enabled ) {
				return;
			}

			const onResize = () => savedUpdateLayout.current();
			window.addEventListener( 'resize', onResize );
			return () => window.removeEventListener( 'resize', onResize );
		}, [ enabled ] );
	}

	const updateEnabled = hasDynamicHeight && numPages > 1;

	useUpdateLayout( updateEnabled, currentPage, () => {
		const targetHeight = pagesRef.current?.querySelector( '.is-current' )?.offsetHeight;
		setPagesStyle( targetHeight ? { height: targetHeight } : undefined );
	} );

	useEffect( () => {
		if ( currentPage >= numPages ) {
			setCurrentPage( numPages - 1 );
		}
	}, [ numPages ] );

	const getPageWidth = () => {
		return pagesRef.current?.getElementsByClassName( 'is-current' )[ 0 ]?.getBoundingClientRect()
			.width;
	};

	const getOffset = ( index ) => {
		return -( getPageWidth() * index );
	};

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

	const handleDrag = ( event ) => {
		if ( ! isDragging ) {
			return;
		}
		const dragPosition = getDragPosition( event );
		const delta = dragPosition.x - dragStartData.x;

		const offset = getOffset( currentPage ) + delta;
		// Allow for swipe left
		if ( numPages !== currentPage + 1 && delta < 0 ) {
			setPagesStyle( {
				...pagesStyle,
				transform: `translate3d(${ offset }px, 0px, 0px)`,
			} );
		} else if ( currentPage !== 0 && delta > 0 ) {
			setPagesStyle( {
				...pagesStyle,
				transform: `translate3d(${ offset }px, 0px, 0px)`,
			} );
		}
	};

	const handleDragEnd = ( event ) => {
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
		setCurrentPage( newIndex );
		setDragStartData( {} );
		setIsDragging( false );
	};

	const width = getPageWidth();

	return (
		<div className={ className } { ...props }>
			<Controls
				showControlLabels={ showControlLabels }
				currentPage={ currentPage }
				numberOfPages={ numPages }
				setCurrentPage={ ( index ) => {
					onPageSelected && onPageSelected( index );
					const offset = getOffset( index );
					setPagesStyle( { ...pagesStyle, transform: `translate3d(${ offset }px, 0px, 0px)` } );
					setCurrentPage( index );
				} }
			/>
			<div
				className="dot-pager__container"
				onDragStart={ handleDragStart }
				onPointerDown={ handleDragStart }
				onDrag={ handleDrag }
				onPointerMove={ handleDrag }
				onDragEnd={ handleDragEnd }
				onPointerUp={ handleDragEnd }
				ref={ pagesRef }
			>
				<div className="dot-pager__pages" style={ pagesStyle }>
					{ Children.map( children, ( child, index ) => (
						<div
							style={ { width: `${ width }px` } } // Setting the page width is important for iOS browser.
							className={ classnames( 'dot-pager__page', {
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
		</div>
	);
};

export default DotPager;
