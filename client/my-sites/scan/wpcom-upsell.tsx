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
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCTA from 'components/promo-section/promo-card/cta';
import useTrackCallback from 'lib/jetpack/use-track-callback';
import Gridicon from 'components/gridicon';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Asset dependencies
 */
import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';
import './style.scss';

const promos: PromoSectionProps = {
	promos: [
		{
			title: translate( 'Jetpack Backup' ),
			body: translate(
				'Granular control over your site, with the ability ' +
					'to restore it to any previous state, and export it at any time.'
			),
			image: <Gridicon icon="cloud-upload" className="scan__upsell-icon" />,
		},
		{
			title: translate( 'Activity Log' ),
			body: translate(
				'A complete record of everything that happens on your site, with history that spans over 30 days.'
			),
			image: <Gridicon icon="history" className="scan__upsell-icon" />,
		},
	],
};

export default function WPCOMScanUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_business_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main className="scan__main scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Scan' ) }
				className="scan__header"
				id="scan-header"
				align="left"
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
						text: translate( 'Upgrade to Business Plan' ),
						action: { url: `/checkout/${ siteSlug }/premium`, onClick: onUpgradeClick },
					} }
				/>
			</PromoCard>

			<FormattedHeader
				headerText={ translate( 'Also included in the Business Plan' ) }
				className="scan__header"
				id="scan-subheader"
				align="left"
				isSecondary
			/>

			<PromoSection { ...promos } />
		</Main>
	);
}
