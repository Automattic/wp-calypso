/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import FormattedHeader from 'components/formatted-header';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCTA from 'components/promo-section/promo-card/cta';
import useTrackCallback from 'lib/jetpack/use-track-callback';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Asset dependencies
 */
import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';
import './style.scss';

export default function WPCOMScanUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main className="scan__main scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Scan' ) }
				id="scan-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={ translate( 'We guard your site. You run your business.' ) }
				image={ { path: JetpackScanSVG } }
				isPrimary
			>
				<p>
					{ translate(
						'Scan gives you automated scanning and one-click fixes ' +
							'to keep your site ahead of security threats.'
					) }
				</p>
				<PromoCardCTA
					cta={ {
						text: translate( 'Get daily scanning' ),
						action: {
							url: `/checkout/${ siteSlug }/jetpack_scan`,
							onClick: onUpgradeClick,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>
		</Main>
	);
}
