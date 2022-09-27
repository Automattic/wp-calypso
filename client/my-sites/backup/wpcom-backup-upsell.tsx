import { WPCOM_FEATURES_FULL_ACTIVITY_LOG } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
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
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const JetpackBackupErrorSVG = '/calypso/images/illustrations/jetpack-cloud-backup-error.svg';

const BackupMultisiteBody = () => {
	const translate = useTranslate();
	return (
		<PromoCard
			title={ preventWidows( translate( 'WordPress multi-sites are not supported' ) ) }
			image={ { path: JetpackBackupErrorSVG } }
			isPrimary
		>
			<p>
				{ preventWidows(
					translate(
						"We're sorry, Jetpack Backup is not compatible with multisite WordPress installations at this time."
					)
				) }
			</p>
		</PromoCard>
	);
};

const BackupVPActiveBody = () => {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_backup_vaultpress_click' );
	const translate = useTranslate();
	return (
		<PromoCard
			title={ preventWidows( translate( 'Your backups are powered by VaultPress' ) ) }
			image={ { path: VaultPressLogo } }
			isPrimary
		>
			<p>{ preventWidows( translate( 'You can access them on your VaultPress Dashboard.' ) ) }</p>
			<div className="backup__wpcom-ctas">
				<Button
					className="backup__wpcom-cta backup__wpcom-realtime-cta"
					href="https://dashboard.vaultpress.com"
					onClick={ onUpgradeClick }
					primary
				>
					{ translate( 'See my backups on VaultPress.com' ) }
				</Button>
			</div>
		</PromoCard>
	);
};

const BackupUpsellBody = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector(
		( state ) => siteId && canCurrentUser( state, siteId, 'manage_options' )
	);
	const translate = useTranslate();
	const postCheckoutUrl = window.location.pathname + window.location.search;
	const isJetpack = useSelector( ( state ) => siteId && isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => siteId && isSiteWpcomAtomic( state, siteId ) );
	const isWPcomSite = ! isJetpack || isAtomic;
	const onUpgradeClick = useTrackCallback(
		undefined,
		isWPcomSite ? 'calypso_jetpack_backup_business_upsell' : 'calypso_jetpack_backup_upsell'
	);
	const hasFullActivityLogFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);
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
		<>
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
						text={ translate( 'Only site administrators can upgrade to access Backup.' ) }
						showDismiss={ false }
					/>
				) }
				{ isAdmin && isWPcomSite && (
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
				{ isAdmin && ! isWPcomSite && (
					<div className="backup__wpcom-ctas">
						<Button
							className="backup__wpcom-cta"
							href={ addQueryArgs( `/checkout/${ siteSlug }/jetpack_backup_t1_yearly`, {
								redirect_to: postCheckoutUrl,
							} ) }
							onClick={ onUpgradeClick }
							primary
						>
							{ translate( 'Get backups' ) }
						</Button>
					</div>
				) }
			</PromoCard>

			{ isWPcomSite && ! hasFullActivityLogFeature && (
				<>
					<h2 className="backup__subheader">
						{ translate( 'Also included in the Business Plan' ) }
					</h2>

					<PromoSection { ...promos } />
				</>
			) }

			{ isWPcomSite && <WhatIsJetpack /> }
		</>
	);
};

export default function WPCOMUpsellPage( { reason }: { reason: string } ) {
	const translate = useTranslate();
	let body;
	switch ( reason ) {
		case 'multisite_not_supported':
			body = <BackupMultisiteBody />;
			break;
		case 'vp_active_on_site':
			body = <BackupVPActiveBody />;
			break;
		case 'no_connected_jetpack':
			body = <JetpackDisconnectedWPCOM />;
			break;
		default:
			body = <BackupUpsellBody />;
	}
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

			{ body }
		</Main>
	);
}
