/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConnectAccounts from 'my-sites/customer-home/cards/tasks/connect-accounts';
import Webinars from 'my-sites/customer-home/cards/tasks/webinars';
import FindDomain from 'my-sites/customer-home/cards/tasks/find-domain';
import SiteSetupList from 'my-sites/customer-home/cards/tasks/site-setup-list';
import DeprecateEditor from 'my-sites/customer-home/cards/tasks/deprecate-editor';
import GoMobile from 'my-sites/customer-home/cards/tasks/go-mobile';
import CelebrateSiteCreation from 'my-sites/customer-home/cards/notices/celebrate-site-creation-v2';
import CelebrateSiteLaunch from 'my-sites/customer-home/cards/notices/celebrate-site-launch-v2';
import CelebrateSiteMigration from 'my-sites/customer-home/cards/notices/celebrate-site-migration-v2';
import CelebrateSiteSetupComplete from 'my-sites/customer-home/cards/notices/celebrate-site-setup-complete-v2';

const cardComponents = {
	'home-task-site-setup-checklist': SiteSetupList,
	'home-task-connect-accounts': ConnectAccounts,
	'home-task-find-domain': FindDomain,
	'home-task-webinars': Webinars,
	'home-task-editor-deprecation': DeprecateEditor,
	'home-task-go-mobile-android': GoMobile,
	'home-task-go-mobile-ios': GoMobile,
	'home-notice-celebrate-site-creation': CelebrateSiteCreation,
	'home-notice-celebrate-site-launch': CelebrateSiteLaunch,
	'home-notice-celebrate-site-migration': CelebrateSiteMigration,
	'home-notice-celebrate-site-setup-complete': CelebrateSiteSetupComplete,
};

const Primary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					React.createElement( cardComponents[ card ], {
						key: index,
						isIos: card === 'home-task-go-mobile-ios' ? true : null,
					} )
			) }
		</>
	);
};

export default Primary;
