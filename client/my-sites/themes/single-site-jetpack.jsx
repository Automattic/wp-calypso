/**
 * External dependencies
 */
import React from 'react';
import { pickBy } from 'lodash';
import { connect } from 'react-redux';

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
import { hasFeature } from 'state/sites/plans/selectors';
import { getLastThemeQuery, getThemesFoundForQuery } from 'state/themes/selectors';
import { hasJetpackSiteJetpackThemesExtendedFeatures } from 'state/sites/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

const ConnectedThemesSelection = connectOptions(
	( props ) => {
		return (
			<ThemesSelection { ...props }
				getOptions={ function( theme ) {
					return pickBy(
						addTracking( props.options ),
						option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
					); } }
			/>
		);
	}
);

const ConnectedSingleSiteJetpack = connectOptions(
	( props ) => {
		const {
			analyticsPath,
			analyticsPageTitle,
			getScreenshotOption,
			search,
			site,
			siteId,
			wpcomTier,
			filter,
			vertical,
			showNoThemesFoundJetpack,
			showNoThemesFoundWpcom,
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
				<ThemeShowcase { ...props }
					siteId={ siteId }
					showNoThemesFound={ showNoThemesFoundJetpack } >
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<ThanksModal
						site={ site }
						source={ 'list' } />
					{ config.isEnabled( 'manage/themes/upload' ) && props.showWpcomThemesList &&
						<div>
							<ConnectedThemesSelection
								options={ [
									'activate',
									'tryandcustomize',
									'preview',
									'customize',
									'separator',
									'info',
									'support',
									'help',
								] }
								defaultOption={ 'activate' }
								secondaryOption={ 'tryandcustomize' }
								search={ search }
								tier={ wpcomTier }
								filter={ filter }
								vertical={ vertical }
								siteId={ siteId /* This is for the options in the '...' menu only */ }
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
								trackScrollPage={ props.trackScrollPage }
								source="wpcom"
								showNoThemesFound={ showNoThemesFoundWpcom }
							/>
						</div>
					}
				</ThemeShowcase>
			</div>
		);
	}
);

export default connect(
	( state, { siteId, tier } ) => {
		const showWpcomThemesList = hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId );
		let showNoThemesFoundJetpack = true;
		let showNoThemesFoundWpcom = true;
		if ( showWpcomThemesList ) {
			const siteQuery = getLastThemeQuery( state, siteId );
			const wpcomQuery = getLastThemeQuery( state, 'wpcom' );
			const siteThemesCount = getThemesFoundForQuery( state, siteId, siteQuery );
			const wpcomThemesCount = getThemesFoundForQuery( state, 'wpcom', wpcomQuery );

			if ( siteThemesCount && ! wpcomThemesCount ) {
				showNoThemesFoundWpcom = false;
			} else if ( ! siteThemesCount && wpcomThemesCount ) {
				showNoThemesFoundJetpack = false;
			} else if ( ! siteThemesCount && ! wpcomThemesCount ) {
				showNoThemesFoundJetpack = false;
			}
		}
		return {
			wpcomTier: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ) ? tier : 'free',
			showWpcomThemesList,
			showNoThemesFoundJetpack,
			showNoThemesFoundWpcom,
		};
	}
)( ConnectedSingleSiteJetpack );
