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
//import { getSitePlan } from 'calypso/state/sites/selectors';
import { /*getSelectedSiteId, */ getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchUpsell(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_search_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	//const siteId = useSelector( getSelectedSiteId );
	//const { product_slug: planSlug } = useSelector( ( state ) => getSitePlan( state, siteId ) );

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
				title={ translate( 'Finely-tuned search for your site.' ) }
				image={ { path: JetpackSearchSVG } }
				isPrimary
			>
				<p>
					{ translate(
						'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
				</p>

				<PromoCardCTA
					cta={ {
						text: translate( 'Get Jetpack Search' ),
						action: {
							url: `/checkout/${ siteSlug }/jetpack_search_monthly`,
							onClick: onUpgradeClick,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>

			<WhatIsJetpack />
		</Main>
	);
}
