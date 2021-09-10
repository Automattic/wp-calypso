import {
	FEATURE_UPLOAD_THEMES,
	PLAN_BUSINESS,
	PLAN_JETPACK_SECURITY_REALTIME,
} from '@automattic/calypso-products';
import { pickBy } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Main from 'calypso/components/main';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { getLastThemeQuery, getThemesFoundForQuery } from 'calypso/state/themes/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { addTracking } from './helpers';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesHeader from './themes-header';
import ThemesSelection from './themes-selection';

const ConnectedThemesSelection = connectOptions( ( props ) => {
	return (
		<ThemesSelection
			{ ...props }
			getOptions={ function ( theme ) {
				return pickBy(
					addTracking( props.options ),
					( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, props.siteId ) )
				);
			} }
		/>
	);
} );

const ConnectedSingleSiteJetpack = connectOptions( ( props ) => {
	const {
		currentPlan,
		emptyContent,
		filter,
		getScreenshotOption,
		isAtomic,
		purchase,
		showWpcomThemesList,
		search,
		siteId,
		vertical,
		tier,
		translate,
		requestingSitePlans,
		siteSlug,
	} = props;

	const isPartnerPlan = purchase && isPartnerPurchase( purchase );

	const displayUpsellBanner = ! requestingSitePlans && currentPlan;

	let upsellBanner = null;
	if ( isAtomic ) {
		upsellBanner = (
			<UpsellNudge
				className="themes__showcase-banner"
				event="calypso_themes_list_install_themes"
				feature={ FEATURE_UPLOAD_THEMES }
				plan={ PLAN_BUSINESS }
				title={ translate( 'Upload your own themes with our Business and eCommerce plans!' ) }
				forceHref={ true }
				showIcon={ true }
			/>
		);
	} else {
		upsellBanner = (
			<UpsellNudge
				forceDisplay
				title={ translate( 'Upload your own themes' ) }
				description={ translate(
					'In addition to uploading your own themes, get comprehensive WordPress' +
						' security, real-time backups, and unlimited video hosting.'
				) }
				event="themes_plans_free_personal_premium"
				showIcon={ true }
				href={ `/checkout/${ siteSlug }/${ PLAN_JETPACK_SECURITY_REALTIME }` }
			/>
		);
	}

	return (
		<Main fullWidthLayout className="themes">
			<SidebarNavigation />
			<ThemesHeader />
			<CurrentTheme siteId={ siteId } />
			{ displayUpsellBanner && ! isAtomic && ! isPartnerPlan && upsellBanner }
			<ThemeShowcase
				{ ...props }
				siteId={ siteId }
				emptyContent={ showWpcomThemesList ? <div /> : null }
				isJetpackSite={ true }
				upsellBanner={ displayUpsellBanner && isAtomic ? upsellBanner : null }
			>
				{ showWpcomThemesList && (
					<div>
						<ConnectedThemesSelection
							origin="wpcom"
							defaultOption={ 'activate' }
							secondaryOption={ 'tryandcustomize' }
							search={ search }
							tier={ tier }
							filter={ filter }
							vertical={ vertical }
							siteId={ siteId /* This is for the options in the '...' menu only */ }
							getScreenshotUrl={ function ( theme ) {
								if ( ! getScreenshotOption( theme ).getUrl ) {
									return null;
								}
								return getScreenshotOption( theme ).getUrl( theme );
							} }
							onScreenshotClick={ function ( themeId ) {
								if ( ! getScreenshotOption( themeId ).action ) {
									return;
								}
								getScreenshotOption( themeId ).action( themeId );
							} }
							getActionLabel={ function ( theme ) {
								return getScreenshotOption( theme ).label;
							} }
							trackScrollPage={ props.trackScrollPage }
							source="wpcom"
							emptyContent={ emptyContent }
						/>
					</div>
				) }
			</ThemeShowcase>
		</Main>
	);
} );

export default connect( ( state, { siteId, tier } ) => {
	const siteSlug = getSelectedSiteSlug( state );
	const currentPlan = getCurrentPlan( state, siteId );
	const isMultisite = isJetpackSiteMultiSite( state, siteId );
	const showWpcomThemesList = ! isMultisite;
	let emptyContent = null;
	if ( showWpcomThemesList ) {
		const siteQuery = getLastThemeQuery( state, siteId );
		const wpcomQuery = getLastThemeQuery( state, 'wpcom' );
		const siteThemesCount = getThemesFoundForQuery( state, siteId, siteQuery );
		const wpcomThemesCount = getThemesFoundForQuery( state, 'wpcom', wpcomQuery );
		emptyContent = ! siteThemesCount && ! wpcomThemesCount ? null : <div />;
	}
	return {
		currentPlan,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		tier,
		showWpcomThemesList,
		emptyContent,
		isAtomic: isAtomicSite( state, siteId ),
		isMultisite,
		requestingSitePlans: isRequestingSitePlans( state, siteId ),
		siteSlug,
	};
} )( ConnectedSingleSiteJetpack );
