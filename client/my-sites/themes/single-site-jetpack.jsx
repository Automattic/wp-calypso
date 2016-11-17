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
import config from 'config';
import JetpackReferrerMessage from './jetpack-referrer-message';
import JetpackUpgradeMessage from './jetpack-upgrade-message';
import JetpackManageDisabledMessage from './jetpack-manage-disabled-message';
import { connectOptions } from './theme-options';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';

export default connectOptions(
	( props ) => {
		const { site, siteId, analyticsPath, analyticsPageTitle } = props;
		const jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );

		if ( ! jetpackEnabled ) {
			return (
				<JetpackReferrerMessage
					site={ site }
					analyticsPath={ analyticsPath }
					analyticsPageTitle={ analyticsPageTitle } />
			);
		}
		if ( ! site.hasJetpackThemes ) {
			return (
				<JetpackUpgradeMessage
					site={ site } />
			);
		}
		if ( ! site.canManage() ) {
			return (
				<JetpackManageDisabledMessage
					site={ site } />
			);
		}

		return (
			<ThemeShowcase { ...props } siteId={ siteId }>
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<SidebarNavigation />
				<ThanksModal
					site={ site }
					source={ 'list' } />
				<CurrentTheme siteId={ siteId } />
			</ThemeShowcase>
		);
	}
);
