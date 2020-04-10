/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import Support from 'my-sites/customer-home/cards/features/support';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';

const cardComponents = {
	'home-feature-go-mobile-desktop': GoMobile,
	'home-feature-support': Support,
	'home-primary-quick-links': QuickLinks,
};

const Management = ( { cards } ) => {
	const translate = useTranslate();

	return (
		<>
			<h2>{ translate( 'Manage your site' ) }</h2>
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
