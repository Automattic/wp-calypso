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
import FormattedHeader from 'components/formatted-header';
import Gridicon from 'components/gridicon';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCTA from 'components/promo-section/promo-card/cta';
import WhatIsJetpack from 'components/jetpack/what-is-jetpack';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import useTrackCallback from 'lib/jetpack/use-track-callback';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
// import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';

export default function WPCOMBusinessAT(): ReactElement {
	const activateAT = useTrackCallback( undefined, 'calypso_jetpack_backup_business_at' );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main className="wpcom-business-at">
			<DocumentHead title="Activate Jetpack Backup now" />
			<SidebarNavigation />
			<PageViewTracker path="/backup/:site" title="Business Plan Upsell" />

			<FormattedHeader
				id="wpcom-business-at-header"
				className="wpcom-business-at__header"
				headerText={ translate( 'Jetpack Backup' ) }
				align="left"
			/>
			<PromoCard
				title={ translate( 'Get time travel for your site with Jetpack Backup.' ) }
				image={ { path: JetpackBackupSVG } }
				isPrimary
			>
				<p>
					{ translate(
						'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
					) }
				</p>
				<PromoCardCTA
					cta={ {
						text: translate( 'Activate Jetpack Backup now' ),
						action: { url: `/checkout/${ siteSlug }/premium`, onClick: activateAT },
					} }
				/>
			</PromoCard>

			<FormattedHeader
				id="wpcom-business-at-subheader"
				className="wpcom-business-at__subheader"
				headerText={ translate( 'Also included in the Business Plan' ) }
				align="left"
				isSecondary
			/>

			<PromoCard title={ translate( 'Jetpack Scan' ) } image={ <Gridicon icon="security" /> }>
				<p>
					{ translate(
						'Automated scanning and one-click fixes to keep your site ahead of security threats.'
					) }
				</p>
			</PromoCard>

			<WhatIsJetpack className="wpcom-business-at__footer" />
		</Main>
	);
}
