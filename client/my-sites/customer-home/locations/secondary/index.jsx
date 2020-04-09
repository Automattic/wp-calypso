/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import LaunchSite from 'my-sites/customer-home/cards/features/launch-site';
import Stats from 'my-sites/customer-home/cards/features/stats';
import Support from 'my-sites/customer-home/cards/features/support';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';
import { translate } from 'i18n-calypso';

const cardComponents = {
	'home-primary-quick-links': QuickLinks,
	'home-action-launch-site': LaunchSite,
	'home-education-free-photo-library': FreePhotoLibrary,
	'home-feature-go-mobile-desktop': GoMobile,
	'home-feature-grow-and-earn': GrowEarn,
	'home-feature-stats': Stats,
	'home-feature-support': Support,
};

const Secondary = ( { cards } ) => {
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

export default Secondary;
