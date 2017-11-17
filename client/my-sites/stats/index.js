/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import statsController from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'jetpack/activity-log' ) ) {
		page( '/stats/activity/:site_id', siteSelection, navigation, statsController.activityLog );
	}
	if ( config.isEnabled( 'manage/stats' ) ) {
		// Stat Overview Page
		page( '/stats', siteSelection, navigation, statsController.overview );
		page( '/stats/day', siteSelection, navigation, statsController.overview );
		page( '/stats/week', siteSelection, navigation, statsController.overview );
		page( '/stats/month', siteSelection, navigation, statsController.overview );
		page( '/stats/year', siteSelection, navigation, statsController.overview );

		// Stat Insights Page
		page( '/stats/insights/:site_id', siteSelection, navigation, statsController.insights );

		// Stat Site Pages
		page( '/stats/day/:site_id', siteSelection, navigation, statsController.site );
		page( '/stats/week/:site_id', siteSelection, navigation, statsController.site );
		page( '/stats/month/:site_id', siteSelection, navigation, statsController.site );
		page( '/stats/year/:site_id', siteSelection, navigation, statsController.site );

		// Stat Summary Pages
		page( '/stats/:module/:site_id', siteSelection, navigation, statsController.summary );
		page( '/stats/day/:module/:site_id', siteSelection, navigation, statsController.summary );
		page( '/stats/week/:module/:site_id', siteSelection, navigation, statsController.summary );
		page( '/stats/month/:module/:site_id', siteSelection, navigation, statsController.summary );
		page( '/stats/year/:module/:site_id', siteSelection, navigation, statsController.summary );

		// Stat Single Post Page
		page( '/stats/post/:post_id/:site_id', siteSelection, navigation, statsController.post );
		page( '/stats/page/:post_id/:site_id', siteSelection, navigation, statsController.post );

		// Stat Follows Page
		page( '/stats/follows/comment/:site_id', siteSelection, navigation, statsController.follows );
		page(
			'/stats/follows/comment/:page_num/:site_id',
			siteSelection,
			navigation,
			statsController.follows
		);

		// Reset first view
		if ( config.isEnabled( 'ui/first-view/reset-route' ) ) {
			page( '/stats/reset-first-view', statsController.resetFirstView );
		}

		// Anything else should require site-selection
		page(
			'/stats/(.*)',
			siteSelection,
			navigation,
			statsController.redirectToDefaultSitePage,
			sites
		);
	}
}
