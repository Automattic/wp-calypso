import { isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactElement } from 'react';
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
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function WPCOMScanUpsellPage(): ReactElement {
	const translate = useTranslate();
	const promos = [
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
	];

	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_business_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const { product_slug: planSlug = '' } =
		useSelector( ( state ) => getSitePlan( state, siteId ) ) ?? {};

	// Don't show the Activity Log promo for Personal or Premium plan owners.
	const filteredPromos: PromoSectionProps = useMemo( () => {
		if ( isPersonalPlan( planSlug ) || isPremiumPlan( planSlug ) ) {
			return { promos: [ promos[ 0 ] ] };
		}
		return { promos };
	}, [ planSlug ] );

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
						text: translate( 'Upgrade to Pro Plan' ),
						action: {
							url: `/checkout/${ siteSlug }/pro`,
							onClick: onUpgradeClick,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>

			<h2 className="scan__subheader">{ translate( 'Also included in the Pro Plan' ) }</h2>

			<PromoSection { ...filteredPromos } />

			<WhatIsJetpack />
		</Main>
	);
}
