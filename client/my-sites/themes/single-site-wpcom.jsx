/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import { FEATURE_ADVANCED_DESIGN } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';

export default connectOptions(
	( props ) => {
		const { site, siteId, translate } = props;

		return (
			<ThemeShowcase { ...props } siteId={ siteId }>
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<SidebarNavigation />
				<ThanksModal
					site={ site }
					source={ 'list' } />
				<CurrentTheme siteId={ siteId } />
				<UpgradeNudge
					title={ translate( 'Get Custom Design with Premium' ) }
					message={ translate( 'Customize your theme using premium fonts, color palettes, and the CSS editor.' ) }
					feature={ FEATURE_ADVANCED_DESIGN }
					event="themes_custom_design"
					/>
			</ThemeShowcase>
		);
	}
 );
