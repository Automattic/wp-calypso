import { WPCOM_FEATURES_FULL_ACTIVITY_LOG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const trackEventName = 'calypso_jetpack_backup_business_upsell';

export default function WPCOMUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, trackEventName );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector( ( state ) =>
		canCurrentUser( state, siteId ?? 0, 'manage_options' )
	);
	const hasFullActivityLogFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);
	const translate = useTranslate();
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

	return (
		<Main className="backup__main backup__wpcom-upsell">
			<DocumentHead title="Jetpack Backup" />
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

			{ ! hasFullActivityLogFeature && (
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
