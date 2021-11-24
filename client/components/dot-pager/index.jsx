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
	const [ pagesStyle, setPagesStyle ] = useState();
	const pagesRef = useRef();
	const numPages = Children.count( children );

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

	return (
		<div className={ className } { ...props }>
			<Controls
				showControlLabels={ showControlLabels }
				currentPage={ currentPage }
				numberOfPages={ numPages }
				setCurrentPage={ ( index ) => {
					onPageSelected && onPageSelected( index );
					setCurrentPage( index );
				} }
			/>
			<div className="dot-pager__pages" ref={ pagesRef } style={ pagesStyle }>
				{ Children.map( children, ( child, index ) => (
					<div
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
	);
};

export default DotPager;
