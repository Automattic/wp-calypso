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
	return (
		<>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
		</>
	);
};

export default Tertiary;
