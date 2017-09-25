/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import userSettings from 'lib/user-settings';
import { trackPageLoad, setPageTitle } from 'reader/controller-helper';

const analyticsPageTitle = 'Reader';

const exported = {
	followingManage( context ) {
		const basePath = route.sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites';
		const mcKey = 'following_manage';
		const { q: sitesQuery, s: subsQuery, sort: subsSortOrder, showMoreResults } = context.query;

		setPageTitle( context, i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
			<AsyncLoad
				require="reader/following-manage"
				key="following-manage"
				initialFollowUrl={ context.query.follow }
				sitesQuery={ sitesQuery }
				subsQuery={ subsQuery }
				showMoreResults={ Boolean( showMoreResults ) }
				subsSortOrder={ subsSortOrder }
				context={ context }
				userSettings={ userSettings }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};

export default exported;

export const { followingEdit, followingManage } = exported;
