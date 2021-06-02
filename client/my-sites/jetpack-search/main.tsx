/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import JetpackSearchUpsell from './upsell';
import JetpackSearchPlaceholder from './placeholder';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import JetpackSearchFooter from './footer';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchMain(): ReactElement {
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isSearchEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );

	if ( ! hasLoadedSitePurchases ) {
		return <JetpackSearchPlaceholder siteId={ siteId } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<QuerySiteSettings siteId={ siteId } />

			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={
					isSearchEnabled
						? translate( 'Jetpack Search is enabled on your site.' )
						: translate( 'Jetpack Search is disabled on your site.' )
				}
				image={ { path: JetpackSearchSVG } }
				isPrimary
			>
				<p>
					{ isSearchEnabled
						? translate( 'Your visitors are getting our fastest search experience.' )
						: translate( 'Enable it to ensure your visitors get our fastest search experience.' ) }
				</p>

				<PromoCardCTA
					cta={ {
						text: translate( 'Settings' ),
						action: {
							url: `/settings/performance/${ siteSlug }`,
							onClick: onSettingsClick,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>

			<JetpackSearchFooter />
		</Main>
	);
}
