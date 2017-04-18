/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import connectSite from 'lib/reader-connect-site';
import SubscriptionListItem from 'blocks/reader-subscription-list-item/';
import userSettings from 'lib/user-settings';

export default localize( connectSite(
	( { feed, site, translate, url, feedId, siteId } ) => (
		<SubscriptionListItem
			translate={ translate }
			feedId={ feedId }
			siteId={ siteId }
			site={ site }
			feed={ feed }
			url={ url }
			isEmailBlocked={ userSettings.getSetting( 'subscription_delivery_email_blocked' ) }
		/>
	)
) );
