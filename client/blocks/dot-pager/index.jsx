/**
 * External dependencies
 */
import React, { Children, useState } from 'react';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

export const DotPagerControls = ( { currentPage, numberOfPages, setCurrentPage } ) => {
	const translate = useTranslate();
	return (
		<ul className="dot-pager__controls" aria-label={ translate( 'Pager controls' ) }>
			{ times( numberOfPages, page => (
				<li key={ page } aria-current={ page === currentPage ? 'page' : undefined }>
					<button
						key={ page }
						aria-label={ translate( 'Page %(page)d of %(numberOfPages)d', {
							args: { page: page + 1, numberOfPages },
						} ) }
						onClick={ () => setCurrentPage( page ) }
					/>
				</li>
			) ) }
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
