/**
 * External dependencies
 */
import React, { ReactElement, Fragment } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

/**
 * Internal component dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackSearchInstantSearchConfig from './jetpack-instant-search-config';
import JetpackSearchModuleConfig from './module-config';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';

/**
 * Internal state dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import hasSearchProductSelector from './hooks/has-search-product';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchMain(): ReactElement {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const hasSearchProduct = useSelector( hasSearchProductSelector );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );
	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

	const siteSettings = useSelector( ( state ) => getSiteSettings( state, siteId ) );
	const isInstantSearchActive = siteSettings && siteSettings[ 'instant_search_enabled' ];

	if ( ! hasLoadedSitePurchases ) {
		return <JetpackSearchPlaceholder siteId={ siteId } />;
	}

	if ( ! hasSearchProduct ) {
		// TODO: Allow toggling just the Search module if Business/Pro plan.
		return <JetpackSearchUpsell />;
	}

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={ translate( 'Jetpack Search is active on your site.' ) }
				image={ { path: JetpackSearchSVG } }
				isPrimary
			>
				<p>{ translate( 'Your visitors are getting our fastest search experience.' ) }</p>

				{ ! config.isEnabled( 'jetpack/search-config' ) && (
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
				) }
			</PromoCard>

			{ config.isEnabled( 'jetpack/search-config' ) && (
				<Fragment>
					<JetpackSearchModuleConfig />
					{ isInstantSearchActive && <JetpackSearchInstantSearchConfig /> }
				</Fragment>
			) }

			{ isWPCOM && <WhatIsJetpack /> }
		</Main>
	);
}
