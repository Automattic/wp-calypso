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
import { isFreePlan } from 'lib/plans';
import FormattedHeader from 'components/formatted-header';
import Notice from 'components/notice';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCTA from 'components/promo-section/promo-card/cta';
import useTrackCallback from 'lib/jetpack/use-track-callback';
import Gridicon from 'components/gridicon';
import { getSitePlan } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import WhatIsJetpack from 'components/jetpack/what-is-jetpack';
import { preventWidows } from 'lib/formatting';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
import './style.scss';

const trackEventName = 'calypso_jetpack_backup_business_upsell';

const promos: PromoSectionProps = {
	promos: [
		{
			title: translate( 'Activity Log' ),
			body: translate(
				'A complete record of everything that happens on your site, with history that spans over 30 days.'
			),
			image: <Gridicon icon="history" className="backup__upsell-icon" />,
		},
	],
};

export default function WPCOMUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, trackEventName );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
	const { product_slug: planSlug } = useSelector( ( state ) => getSitePlan( state, siteId ) );

	return (
		<Main className="backup__main backup__wpcom-upsell">
			<DocumentHead title="Jetpack Backup" />
			<SidebarNavigation />
			<PageViewTracker path="/backup/:site" title="Backup" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Backup' ) }
				id="backup-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={ preventWidows( translate( 'Get time travel for your site with Jetpack Backup' ) ) }
				image={ { path: JetpackBackupSVG } }
				isPrimary
			>
				<p>
					{ preventWidows(
						translate(
							'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
						)
					) }
				</p>
				{ ! isAdmin && (
					<Notice
						status="is-warning"
						text={ translate( 'Only site administrators can upgrade to the Business plan.' ) }
						showDismiss={ false }
					/>
				) }
				{ isAdmin && (
					<PromoCardCTA
						cta={ {
							text: translate( 'Upgrade to Business Plan' ),
							action: {
								url: `/checkout/${ siteSlug }/business`,
								onClick: onUpgradeClick,
								selfTarget: true,
							},
						} }
					/>
				) }
			</PromoCard>

			{ isFreePlan( planSlug ) && (
				<>
					<h2 className="backup__subheader">
						{ translate( 'Also included in the Business Plan' ) }
					</h2>

					<PromoSection { ...promos } />
				</>
			) }

			<WhatIsJetpack />
		</Main>
	);
}
