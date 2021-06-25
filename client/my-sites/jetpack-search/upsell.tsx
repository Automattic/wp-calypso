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
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackSearchContent from './content';
import JetpackSearchFooter from './footer';
import JetpackSearchLogo from './logo';

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

			<JetpackSearchContent
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
