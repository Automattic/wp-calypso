/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ManageSite from './manage-site';

const cardComponents = {
	'home-section-manage-site': ManageSite,
};

const Tertiary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map( ( card, index ) =>
				React.createElement( cardComponents[ card ], {
					key: index,
				} )
			) }
		</>
	);
};

export default Tertiary;
