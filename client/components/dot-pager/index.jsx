/**
 * External dependencies
 */
import React, { Children, useState } from 'react';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import classnames from 'classnames';
import { Icon, arrowRight } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';

const Controls = ( { currentPage, numberOfPages, setCurrentPage } ) => {
	const translate = useTranslate();
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
						className={ classnames( { 'dot-pager__control-current': page === currentPage } ) }
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
						style={ { transform: 'scaleX(-1)' } }
					/>
				</button>
			</li>
			<li key="dot-pager-next">
				<button
					className="dot-pager__control-next"
					disabled={ ! canGoForward }
					aria-label={ translate( 'Next' ) }
					onClick={ () => setCurrentPage( currentPage + 1 ) }
				>
					<Icon icon={ arrowRight } size={ 18 } fill="currentColor" />
				</button>
			</li>
		</ul>
	);
};

export const DotPager = ( { children, className } ) => {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	return (
		<Card className={ className }>
			<Controls
				currentPage={ currentPage }
				numberOfPages={ Children.count( children ) }
				setCurrentPage={ setCurrentPage }
			/>
			<div className="dot-pager__pages">
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
		</Card>
	);
};

export default DotPager;
