/**
 * External dependencies
 */
import React from 'react';
import { pickBy } from 'lodash';

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
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import ThemesSelection from './themes-selection';
import { addTracking } from './helpers';

export default connectOptions(
	( props ) => {
		const {
			analyticsPath,
			analyticsPageTitle,
			getScreenshotOption,
			options,
			search,
			site,
			siteId
		} = props;
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
			<div>
				<SidebarNavigation />
				<CurrentTheme siteId={ siteId } />
				<ThemeShowcase { ...props } siteId={ siteId }>
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<ThanksModal
						site={ site }
						source={ 'list' } />
					<ThemesSelection query={ /* TBD */ }
						selectedSite={ false }
						getScreenshotUrl={ function( theme ) {
							if ( ! getScreenshotOption( theme ).getUrl ) {
								return null;
							}
							return getScreenshotOption( theme ).getUrl( theme );
						} }
						onScreenshotClick={ function( theme ) {
							if ( ! getScreenshotOption( theme ).action ) {
								return;
							}
							getScreenshotOption( theme ).action( theme );
						} }
						getActionLabel={ function( theme ) {
							return getScreenshotOption( theme ).label;
						} }
						getOptions={ function( theme ) {
							return pickBy(
								addTracking( options ),
								option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
							); } }
						trackScrollPage={ props.trackScrollPage } />
				</ThemeShowcase>
			</div>
		);
	}
);
