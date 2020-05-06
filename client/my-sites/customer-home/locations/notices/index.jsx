/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateSiteCreation from 'my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'my-sites/customer-home/cards/notices/celebrate-site-setup-complete';

const cardComponents = {
	'home-notice-celebrate-site-creation': CelebrateSiteCreation,
	'home-notice-celebrate-site-launch': CelebrateSiteLaunch,
	'home-notice-celebrate-site-migration': CelebrateSiteMigration,
	'home-notice-celebrate-site-setup-complete': CelebrateSiteSetupComplete,
};

const Notices = ( { checklistMode, displayChecklist, cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map( ( card, index ) =>
				React.createElement( cardComponents[ card ], {
					key: index,
					checklistMode,
					displayChecklist,
				} )
			) }
		</>
	);
};

export default Notices;
