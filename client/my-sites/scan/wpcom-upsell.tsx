import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import JetpackScanSVG from 'calypso/assets/images/illustrations/jetpack-scan.svg';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function WPCOMScanUpsellPage() {
	const translate = useTranslate();
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_business_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';

	return (
		<Main fullWidthLayout className="scan scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
			<PageViewTracker path="/scan/:site" title="Scanner" />

			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Scan' ) } /> }
				subTitle={ translate( 'Automated malware scanning and firewall protection.' ) }
			>
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
							text: translate( 'Upgrade to %(planName)s Plan', {
								args: {
									planName: businessPlanName,
								},
							} ),
							action: {
								url: `/checkout/${ siteSlug }/${ PLAN_BUSINESS }`,
								onClick: onUpgradeClick,
								selfTarget: true,
							},
						} }
					/>
				</PromoCard>

				<WhatIsJetpack />
			</Page>
			<JetpackFooter />
		</Main>
	);
}
