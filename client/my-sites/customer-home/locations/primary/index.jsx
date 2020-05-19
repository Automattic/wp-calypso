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
import CelebrateSiteCreation from 'my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'my-sites/customer-home/cards/notices/celebrate-site-setup-complete';
import {
	NOTICE_CELEBRATE_SITE_CREATION,
	NOTICE_CELEBRATE_SITE_LAUNCH,
	NOTICE_CELEBRATE_SITE_MIGRATION,
	NOTICE_CELEBRATE_SITE_SETUP_COMPLETE,
	TASK_CONNECT_ACCOUNTS,
	TASK_EDITOR_DEPRECATION,
	TASK_FIND_DOMAIN,
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
	TASK_SITE_SETUP_CHECKLIST,
	TASK_WEBINARS,
} from 'my-sites/customer-home/cards/constants';
import { PerformanceTrackerStop } from 'lib/performance-tracking';

const cardComponents = {
	[ TASK_SITE_SETUP_CHECKLIST ]: SiteSetupList,
	[ TASK_CONNECT_ACCOUNTS ]: ConnectAccounts,
	[ TASK_FIND_DOMAIN ]: FindDomain,
	[ TASK_WEBINARS ]: Webinars,
	[ TASK_EDITOR_DEPRECATION ]: DeprecateEditor,
	[ TASK_GO_MOBILE_ANDROID ]: GoMobile,
	[ TASK_GO_MOBILE_IOS ]: GoMobile,
	[ NOTICE_CELEBRATE_SITE_CREATION ]: CelebrateSiteCreation,
	[ NOTICE_CELEBRATE_SITE_LAUNCH ]: CelebrateSiteLaunch,
	[ NOTICE_CELEBRATE_SITE_MIGRATION ]: CelebrateSiteMigration,
	[ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE ]: CelebrateSiteSetupComplete,
};

const Primary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return <PerformanceTrackerStop id={ 'home' } />;
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
			<PerformanceTrackerStop id={ 'home' } />
		</>
	);
};

export default Primary;
