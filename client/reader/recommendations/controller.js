/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import trackScrollPage from 'lib/track-scroll-page';
import titleActions from 'lib/screen-title/actions';
import i18n from 'lib/mixins/i18n';
import { trackPageLoad } from 'reader/controller-helper';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	recommendedForYou() {
		const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

		ReactDom.render(
			React.createElement( RecommendedForYou, {
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				)
			} ),
			document.getElementById( 'primary' )
		);

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		titleActions.setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) );
	}
};
