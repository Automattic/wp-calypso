import { isEnabled } from '@automattic/calypso-config';
import { getQueryString } from '@wordpress/url';
import i18n from 'i18n-calypso';
import page from 'page';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad, setPageTitle } from 'calypso/reader/controller-helper';

const analyticsPageTitle = 'Reader';

const exported = {
	followingManage( context, next ) {
		if ( isEnabled( 'subscription-management-redirect-following' ) ) {
			const queryString = getQueryString( window.location.href );
			return page.redirect( '/read/subscriptions' + ( queryString ? '?' + queryString : '' ) );
		}

		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage Followed Sites';
		const mcKey = 'following_manage';
		const { q: sitesQuery, s: subsQuery, sort: subsSortOrder, showMoreResults } = context.query;

		setPageTitle( context, i18n.translate( 'Manage followed sites' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = (
			<AsyncLoad
				require="calypso/reader/following-manage"
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

export const { followingManage } = exported;
