import {
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_FULL_ACTIVITY_LOG,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import JetpackScanSVG from 'calypso/assets/images/illustrations/jetpack-scan.svg';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import Main from 'calypso/components/main';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function WPCOMScanUpsellPage(): ReactElement {
	const translate = useTranslate();
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_business_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const hasBackups = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);
	const hasFullActivityLog = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);

	const promos = [
		{
			title: translate( 'Jetpack Backup' ),
			body: translate(
				'Granular control over your site, with the ability ' +
					'to restore it to any previous state, and export it at any time.'
			),
			image: <Gridicon icon="cloud-upload" className="scan__upsell-icon" />,
			isShown: ! hasBackups,
		},
		{
			title: translate( 'Activity Log' ),
			body: translate(
				'A complete record of everything that happens on your site, with history that spans over 30 days.'
			),
			image: <Gridicon icon="history" className="scan__upsell-icon" />,
			isShown: ! hasFullActivityLog,
		},
	];

	// Only show promos for features the blog does not already have.
	const filteredPromos: PromoSectionProps = { promos: promos.filter( ( p ) => p.isShown ) };

	return (
		<Main className="scan scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
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
						text: translate( 'Upgrade to Business Plan' ),
						action: {
							url: `/checkout/${ siteSlug }/pro`,
							onClick: onUpgradeClick,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>

			{ filteredPromos.promos.length > 0 && (
				<>
					<h2 className="scan__subheader">{ translate( 'Also included in the Business Plan' ) }</h2>
					<PromoSection { ...filteredPromos } />
				</>
			) }

			<WhatIsJetpack />
		</Main>
	);
}
