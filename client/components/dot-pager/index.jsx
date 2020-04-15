/**
 * External dependencies
 */
import React, { Children, useState } from 'react';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export const DotPagerControls = ( { currentPage, numberOfPages, setCurrentPage } ) => {
	const translate = useTranslate();
	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < numberOfPages - 1;
	return (
		<ul className="dot-pager__controls" aria-label={ translate( 'Pager controls' ) }>
			<li>
				<button
					className="dot-pager__prev"
					disabled={ ! canGoBack }
					aria-label={ translate( 'Previous' ) }
					onClick={ () => setCurrentPage( currentPage - 1 ) }
				>
					<Gridicon icon="chevron-left" size={ 18 } />
				</button>
			</li>
			{ times( numberOfPages, page => (
				<li key={ page } aria-current={ page === currentPage ? 'page' : undefined }>
					<button
						key={ page }
						className={ page === currentPage ? 'dot-pager__current' : undefined }
						disabled={ page === currentPage }
						aria-label={ translate( 'Page %(page)d of %(numberOfPages)d', {
							args: { page: page + 1, numberOfPages },
						} ) }
						onClick={ () => setCurrentPage( page ) }
					/>
				</li>
			) ) }
			<li>
				<button
					className="dot-pager__next"
					disabled={ ! canGoForward }
					aria-label={ translate( 'Next' ) }
					onClick={ () => setCurrentPage( currentPage + 1 ) }
				>
					<Gridicon icon="chevron-right" size={ 18 } />
				</button>
			</li>
		</ul>
	);
};

export const DotPager = ( { children } ) => {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	return (
		<Card>
			{ children[ currentPage ] }
			<DotPagerControls
				currentPage={ currentPage }
				numberOfPages={ Children.count( children ) }
				setCurrentPage={ setCurrentPage }
			/>
		</Card>
	);
};

export default DotPager;
