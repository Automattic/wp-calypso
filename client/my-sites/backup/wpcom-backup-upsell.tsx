import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_FULL_ACTIVITY_LOG,
	getPlan,
} from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BackupDownloadFlowExpiredPlan from './rewind-flow/download-expired-plan';
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
						"We're sorry, Jetpack VaultPress Backup is not compatible with multisite WordPress installations at this time."
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
	const checkoutHost = isJetpackCloud() ? 'https://wordpress.com' : '';
	const isJetpack = useSelector( ( state ) => siteId && isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => siteId && isSiteWpcomAtomic( state, siteId ) );
	const isWPcomSite = ! isJetpack || isAtomic;

	const [ isRevertedWithValidBackup, setIsRevertedWithValidBackup ] = useState< null | boolean >(
		null
	);

	const [ rewindId, setRewindId ] = useState< string | null >( null );
	const [ backupPeriodDate, setBackupPeriodDate ] = useState< string | null >( null );

	const resetBackupState = () => {
		setIsRevertedWithValidBackup( false );
		setRewindId( null );
		setBackupPeriodDate( null );
	};

	const fetchLatestAtomicTransfer = useCallback( async ( siteId: number | string ) => {
		try {
			const transfer = await wpcom.req.get( {
				path: `/sites/${ siteId }/atomic/transfers/latest`,
				apiNamespace: 'wpcom/v2',
			} );
			return transfer;
		} catch ( error ) {
			return null;
		}
	}, [] );

	const fetchRewindBackups = useCallback( async ( siteId: number | string ) => {
		try {
			const response = await wpcom.req.get( {
				path: `/sites/${ siteId }/rewind/backups`,
				apiNamespace: 'wpcom/v3',
				query: { number: 10 },
			} );

			const validBackup = response.backups?.find(
				( backup: { is_rewindable: boolean; summary: string } ) =>
					backup.is_rewindable && backup.summary === 'Backup complete'
			);

			if ( validBackup ) {
				const backupPeriod = validBackup.object.backup_period;
				const backupPeriodHumanReadable = new Date(
					parseInt( backupPeriod ) * 1000
				).toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } );

				setIsRevertedWithValidBackup( true );
				setRewindId( validBackup.object.backup_period );
				setBackupPeriodDate( backupPeriodHumanReadable );
			} else {
				resetBackupState();
			}
		} catch ( error ) {
			resetBackupState();
		}
	}, [] );

	useEffect( () => {
		if ( siteId ) {
			( async () => {
				const transferStatus = await fetchLatestAtomicTransfer( siteId );

				if ( transferStatus && transferStatus.status === 'reverted' ) {
					await fetchRewindBackups( siteId );
				} else {
					resetBackupState();
				}
			} )();
		}
	}, [ fetchLatestAtomicTransfer, fetchRewindBackups, siteId ] );

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
				title={ preventWidows(
					translate( 'Get time travel for your site with Jetpack VaultPress Backup' )
				) }
				image={ { path: JetpackBackupSVG } }
				isPrimary
			>
				<p>
					{ preventWidows(
						translate(
							'VaultPress Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
						)
					) }
				</p>
				{ ! isAdmin && (
					<Notice
						status="is-warning"
						text={ translate(
							'Only site administrators can upgrade to access VaultPress Backup.'
						) }
						showDismiss={ false }
					/>
				) }
				{ isAdmin && isWPcomSite && (
					<PromoCardCTA
						cta={ {
							text: translate( 'Upgrade to %(planName)s Plan', {
								args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
							} ),
							action: {
								url: `${ checkoutHost }/checkout/${ siteSlug }/business`,
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
							href={ addQueryArgs(
								`${ checkoutHost }/checkout/${ siteSlug }/jetpack_backup_t1_yearly`,
								{
									redirect_to: postCheckoutUrl,
								}
							) }
							onClick={ onUpgradeClick }
							primary
						>
							{ translate( 'Get backups' ) }
						</Button>
					</div>
				) }
			</PromoCard>
			{ isRevertedWithValidBackup && backupPeriodDate && rewindId && siteSlug && siteId && (
				<BackupDownloadFlowExpiredPlan
					backupDisplayDate={ backupPeriodDate }
					rewindId={ rewindId }
					siteId={ siteId }
					siteUrl={ siteSlug }
				/>
			) }
			{ isWPcomSite && ! hasFullActivityLogFeature && (
				<>
					<h2 className="backup__subheader">
						{ translate( 'Also included in the %(planName)s Plan', {
							args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
						} ) }
					</h2>

					<PromoSection { ...promos } />
				</>
			) }

			{ ! isJetpackCloud() && isWPcomSite && <WhatIsJetpack /> }
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
			<DocumentHead title="Jetpack VaultPress Backup" />
			<PageViewTracker path="/backup/:site" title="VaultPress Backup" />
			<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack VaultPress Backup' ) } />

			{ body }
		</Main>
	);
}
