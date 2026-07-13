import { PLAN_BUSINESS, PLAN_ECOMMERCE, getPlan } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Page } from '@wordpress/admin-ui';
import { Icon } from '@wordpress/components';
import { backup } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnectedWPCOM from 'calypso/components/jetpack/jetpack-disconnected-wpcom';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import illustrationUrl from './backups-callout-illustration.svg';
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

	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
	const commercePlanName = getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '';

	return (
		<>
			{ isWPcomSite ? (
				<div className="backup__upsell-callout">
					<div className="backup__upsell-callout-content">
						<Icon className="backup__upsell-callout-icon" icon={ backup } />
						<h2 className="backup__upsell-callout-title">
							{ translate( 'Secure your content with Jetpack VaultPress Backup' ) }
						</h2>
						<p className="backup__upsell-callout-description">
							{ translate(
								'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
							) }
						</p>
						<p className="backup__upsell-callout-description">
							{ translate(
								// translators: %(businessPlanName)s is the Business plan name, %(commercePlanName)s is the Commerce plan name
								'Available on the WordPress.com %(businessPlanName)s and %(commercePlanName)s plans.',
								{ args: { businessPlanName, commercePlanName } }
							) }
						</p>
						{ isAdmin ? (
							<Button
								className="backup__upsell-callout-button"
								href={ `${ checkoutHost }/checkout/${ siteSlug }/business` }
								onClick={ onUpgradeClick }
								primary
							>
								{ translate( 'Upgrade plan' ) }
							</Button>
						) : (
							<Notice
								status="is-warning"
								showDismiss={ false }
								text={ translate(
									'Only site administrators can upgrade to access VaultPress Backup.'
								) }
							/>
						) }
					</div>
					<div className="backup__upsell-callout-image" aria-hidden="true">
						<img src={ illustrationUrl } alt="" />
					</div>
				</div>
			) : (
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
					{ isAdmin && (
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
			) }
			{ isRevertedWithValidBackup && backupPeriodDate && rewindId && siteSlug && siteId && (
				<BackupDownloadFlowExpiredPlan
					backupDisplayDate={ backupPeriodDate }
					rewindId={ rewindId }
					siteId={ siteId }
					siteUrl={ siteSlug }
				/>
			) }
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
		<Main fullWidthLayout className="backup__main backup__wpcom-upsell">
			<DocumentHead title="Jetpack VaultPress Backup" />
			<PageViewTracker path="/backup/:site" title="VaultPress Backup" />

			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Backup' ) } /> }
				subTitle={ translate( 'Save changes and restore quickly with one-click recovery.' ) }
			>
				{ body }
			</Page>
			<JetpackFooter />
		</Main>
	);
}
