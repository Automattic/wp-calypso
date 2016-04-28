/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import i18n from 'lib/mixins/i18n';
import titleActions from 'lib/screen-title/actions';
import route from 'lib/route';
import userSettings from 'lib/user-settings';

const analyticsPageTitle = 'Reader';

function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

function setPageTitle( title ) {
	titleActions.setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) );
}

export default {
	followingEdit( context ) {
		var FollowingEdit = require( 'reader/following-edit' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites',
			mcKey = 'following_edit',
			search = context.query.s;

		setPageTitle( i18n.translate( 'Manage Followed Sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( FollowingEdit, {
				key: 'following-edit',
				initialFollowUrl: context.query.follow,
				search: search,
				context: context,
				userSettings: userSettings
			} ),
			document.getElementById( 'primary' )
		);
	}
};
