/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import Support from 'my-sites/customer-home/cards/features/support';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';

const cardComponents = {
	'home-feature-go-mobile-desktop': GoMobile,
	'home-feature-grow-and-earn': GrowEarn,
	'home-feature-support': Support,
	'home-primary-quick-links': QuickLinks,
};

const Management = ( { cards } ) => {
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

export default Management;
