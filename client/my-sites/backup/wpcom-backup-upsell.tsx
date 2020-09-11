/**
 * External dependencies
 */
import React, { ReactElement, FunctionComponent } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { addQueryArgs } from '@wordpress/url';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { preventWidows } from 'lib/formatting';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import Notice from 'components/notice';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PromoCard from 'components/promo-section/promo-card';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import useTrackCallback from 'lib/jetpack/use-track-callback';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
import VaultPressLogo from './vaultpress-logo.svg';
import './style.scss';

const JetpackBackupErrorSVG = '/calypso/images/illustrations/jetpack-cloud-backup-error.svg';

const BackupMultisiteBody: FunctionComponent = () => (
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

const BackupVPActiveBody: FunctionComponent = () => {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_backup_vaultpress_click' );
	return (
		<PromoCard
			title={ preventWidows( translate( 'Your backups are powered by VaultPress' ) ) }
			image={ <img src={ VaultPressLogo } width="155" alt="VaultPress logo" /> }
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

const BackupUpsellBody: FunctionComponent = () => {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_backup_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector(
		( state ) => siteId && canCurrentUser( state, siteId, 'manage_options' )
	);
	return (
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

			{ isAdmin && (
				<div className="backup__wpcom-ctas">
					<Button
						className="backup__wpcom-cta backup__wpcom-realtime-cta"
						href={ addQueryArgs( `/checkout/${ siteSlug }/jetpack_backup_realtime`, {
							redirect_to: window.location.href,
						} ) }
						onClick={ onUpgradeClick }
						primary
					>
						{ translate( 'Get real-time backups' ) }
					</Button>
					<Button
						className="backup__wpcom-cta backup__wpcom-daily-cta"
						href={ addQueryArgs( `/checkout/${ siteSlug }/jetpack_backup_daily`, {
							redirect_to: window.location.href,
						} ) }
						onClick={ onUpgradeClick }
					>
						{ translate( 'Get daily backups' ) }
					</Button>
				</div>
			) }
		</PromoCard>
	);
};

export default function WPCOMUpsellPage( { reason }: { reason: string } ): ReactElement {
	let body;
	switch ( reason ) {
		case 'multisite_not_supported':
			body = <BackupMultisiteBody />;
			break;
		case 'vp_active_on_site':
			body = <BackupVPActiveBody />;
			break;
		default:
			body = <BackupUpsellBody />;
	}
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

			{ body }
		</Main>
	);
}
