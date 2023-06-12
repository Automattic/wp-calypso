import { Icon, arrowRight } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate, useRtl } from 'i18n-calypso';
import { times } from 'lodash';
import { Children, useState, useEffect } from 'react';
import Swipeable from '../swipeable';

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
	className = '',
	onPageSelected = null,
	isClickEnabled = false,
	rotateTime = 0,
	...props
} ) => {
	// Filter out the empty children
	const normalizedChildren = Children.toArray( children ).filter( Boolean );

	const [ currentPage, setCurrentPage ] = useState( 0 );

	const numPages = Children.count( normalizedChildren );

	useEffect( () => {
		if ( currentPage >= numPages ) {
			setCurrentPage( numPages - 1 );
		}
	}, [ numPages, currentPage ] );

	useEffect( () => {
		if ( rotateTime > 0 && numPages > 1 ) {
			const timerId = setTimeout( () => {
				setCurrentPage( ( currentPage + 1 ) % numPages );
			}, rotateTime );

			return () => clearTimeout( timerId );
		}
	}, [ currentPage, numPages, rotateTime ] );

	const handleSelectPage = ( index ) => {
		setCurrentPage( index );
		onPageSelected?.( index );
	};

	return (
		<div className={ classnames( 'dot-pager', className ) } { ...props }>
			<Controls
				showControlLabels={ showControlLabels }
				currentPage={ currentPage }
				numberOfPages={ numPages }
				setCurrentPage={ handleSelectPage }
			/>
			<Swipeable
				hasDynamicHeight={ hasDynamicHeight }
				onPageSelect={ handleSelectPage }
				currentPage={ currentPage }
				pageClassName="dot-pager__page"
				containerClassName="dot-pager__pages"
				isClickEnabled={ isClickEnabled }
			>
				{ normalizedChildren }
			</Swipeable>
		</div>
	);
};

export default DotPager;
