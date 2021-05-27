/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
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
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackSearchFooter from './footer';
import Upsell from 'calypso/components/jetpack/upsell';
import JetpackSearchLogo from './logo';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchUpsell(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_search_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const upgradeUrl =
		'/checkout/' +
		siteSlug +
		'/jetpack_search_monthly?utm_campaign=my-sites-jetpack-search&utm_source=calypso';

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			<Upsell
				headerText={ translate( 'Finely-tuned search for your site.' ) }
				bodyText={ translate(
					'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
				) }
				buttonLink={ upgradeUrl }
				buttonText={ translate( 'Upgrade to Jetpack Search' ) }
				onClick={ onUpgradeClick }
				iconComponent={ <JetpackSearchLogo /> }
			/>

			<JetpackSearchFooter />
		</Main>
	);
}
