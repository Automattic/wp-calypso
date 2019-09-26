/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { sectionify } from 'lib/route';
import { trackPageLoad, setPageTitle } from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

const exported = {
	followingManage( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites';
		const mcKey = 'following_manage';
		const { q: sitesQuery, s: subsQuery, sort: subsSortOrder, showMoreResults } = context.query;

		setPageTitle( context, i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = (
			<AsyncLoad
				require="reader/following-manage"
				key="following-manage"
				initialFollowUrl={ context.query.follow }
				sitesQuery={ sitesQuery }
				subsQuery={ subsQuery }
				showMoreResults={ Boolean( showMoreResults ) }
				subsSortOrder={ subsSortOrder }
				context={ context }
			/>
		);
		next();
	},
};

export default exported;

export const { followingEdit, followingManage } = exported;
