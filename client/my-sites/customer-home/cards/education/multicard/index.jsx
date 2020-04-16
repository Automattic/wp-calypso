/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { DotPagerControls } from 'components/dot-pager';

/**
 * Style dependencies
 */
import './style.scss';

const MultiCard = ( { cards } ) => {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	return (
		<Card className="multicard">
			{ cards }
			<DotPagerControls
				currentPage={ currentPage }
				numberOfPages={ cards.length }
				setCurrentPage={ setCurrentPage }
			/>
		</Card>
	);
};

export default MultiCard;
