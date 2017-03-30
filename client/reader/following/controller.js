/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import userSettings from 'lib/user-settings';
import { trackPageLoad, setPageTitle } from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

export default {
	followingEdit(context, next) {
	    const basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites',
			mcKey = 'following_edit',
			search = context.query.s;

		setPageTitle( context, i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = <AsyncLoad
			require="reader/following-edit"
			key="following-edit"
			initialFollowUrl={ context.query.follow }
			search={ search }
			context={ context }
			userSettings={ userSettings }
		/>;
		next();
	},

	followingManage(context, next) {
	    const basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites',
			mcKey = 'following_edit',
			search = context.query.s;

		setPageTitle( context, i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = <AsyncLoad
			require="reader/following-manage"
			key="following-manage"
			initialFollowUrl={ context.query.follow }
			search={ search }
			context={ context }
			userSettings={ userSettings }
		/>;
		next();
	}
};
