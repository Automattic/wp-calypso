/**
 * External dependencies
 */
import React, { useEffect } from 'react';

/**
 * Internal dependencies
 */
import ConnectAccounts from 'my-sites/customer-home/cards/tasks/connect-accounts';
import Webinars from 'my-sites/customer-home/cards/tasks/webinars';
import FindDomain from 'my-sites/customer-home/cards/tasks/find-domain';
import SiteSetupList from 'my-sites/customer-home/cards/tasks/site-setup-list';
import SiteSetupListEcommerce from 'my-sites/customer-home/cards/tasks/site-setup-checklist-ecommerce';
import GoMobile from 'my-sites/customer-home/cards/tasks/go-mobile';
import EarnFeatures from 'my-sites/customer-home/cards/tasks/earn-features';
import GrowthSummit from 'my-sites/customer-home/cards/tasks/growth-summit';
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
	TASK_FIND_DOMAIN,
	TASK_SITE_SETUP_CHECKLIST_ECOMMERCE,
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
	TASK_SITE_SETUP_CHECKLIST,
	TASK_WEBINARS,
	TASK_EARN_FEATURES,
	TASK_GROWTH_SUMMIT,
} from 'my-sites/customer-home/cards/constants';
import { withPerformanceTrackerStop } from 'lib/performance-tracking';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { connect } from 'react-redux';

const cardComponents = {
	[ TASK_SITE_SETUP_CHECKLIST_ECOMMERCE ]: SiteSetupListEcommerce,
	[ TASK_SITE_SETUP_CHECKLIST ]: SiteSetupList,
	[ TASK_CONNECT_ACCOUNTS ]: ConnectAccounts,
	[ TASK_FIND_DOMAIN ]: FindDomain,
	[ TASK_WEBINARS ]: Webinars,
	[ TASK_GO_MOBILE_ANDROID ]: GoMobile,
	[ TASK_GO_MOBILE_IOS ]: GoMobile,
	[ TASK_EARN_FEATURES ]: EarnFeatures,
	[ TASK_GROWTH_SUMMIT ]: GrowthSummit,
	[ NOTICE_CELEBRATE_SITE_CREATION ]: CelebrateSiteCreation,
	[ NOTICE_CELEBRATE_SITE_LAUNCH ]: CelebrateSiteLaunch,
	[ NOTICE_CELEBRATE_SITE_MIGRATION ]: CelebrateSiteMigration,
	[ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE ]: CelebrateSiteSetupComplete,
};

const Primary = ( { cards, trackCards } ) => {
	useEffect( () => {
		if ( cards && cards.length ) {
			trackCards( cards );
		}
	}, [ cards, trackCards ] );

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

const trackCardImpressions = ( cards ) => {
	const analyticsEvents = cards.reduce( ( events, card ) => {
		return [
			...events,
			recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
			bumpStat( 'calypso_customer_home_card_impression', card ),
		];
	}, [] );
	return composeAnalytics( ...analyticsEvents );
};

export default withPerformanceTrackerStop(
	connect( null, { trackCards: trackCardImpressions } )( Primary )
);
