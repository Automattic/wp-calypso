/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Upsell from 'calypso/components/jetpack/upsell';
import { UpsellComponentProps } from 'calypso/components/jetpack/upsell-switch';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import './style.scss';

const BackupsUpsellIcon: FunctionComponent = () => (
	<div className="backup-upsell__icon-header">
		<img
			src="/calypso/images/illustrations/jetpack-cloud-backup-error.svg"
			alt="jetpack cloud backup error"
		/>
	</div>
);

const VaultPressIcon = () => (
	<div className="backup-upsell__icon-header">
		<img src={ VaultPressLogo } alt="VaultPress logo" />
	</div>
);

const BackupsMultisiteBody: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<Upsell
			headerText={ translate( 'WordPress multi-sites are not supported' ) }
			bodyText={ translate(
				"We're sorry, Jetpack Backup is not compatible with multisite WordPress installations at this time."
			) }
			iconComponent={ <BackupsUpsellIcon /> }
		/>
	);
};

const BackupsVPActiveBody: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return (
		<Upsell
			headerText={ translate( 'Your backups are powered by VaultPress' ) }
			bodyText={ translate( 'You can access them on your VaultPress Dashboard.' ) }
			buttonLink="https://dashboard.vaultpress.com/"
			buttonText={ translate( 'Visit Dashboard' ) }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_vaultpress_click' ) ) }
			iconComponent={ <VaultPressIcon /> }
		/>
	);
};

const BackupsUpsellBody: FunctionComponent = () => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();
	return (
		<Upsell
			headerText={ translate( 'Your site does not have backups' ) }
			bodyText={ translate(
				'Get peace of mind knowing your work will be saved, add backups today. Choose from real time or daily backups.'
			) }
			buttonLink={ `https://jetpack.com/upgrade/backup/?site=${ selectedSiteSlug }` }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_upsell_click' ) ) }
			iconComponent={ <BackupsUpsellIcon /> }
		/>
	);
};

const BackupsUpsellPage: FunctionComponent< UpsellComponentProps > = ( { reason } ) => {
	let body;
	switch ( reason ) {
		case 'vp_active_on_site':
			body = <BackupsVPActiveBody />;
			break;
		case 'multisite_not_supported':
			body = <BackupsMultisiteBody />;
			break;
		case 'no_connected_jetpack':
			body = <JetpackDisconnected />;
			break;
		default:
			body = <BackupsUpsellBody />;
			break;
	}
	return (
		<Main className="backup-upsell">
			<DocumentHead title="Backup" />
			<SidebarNavigation />
			<div className="backup-upsell__content">{ body }</div>
		</Main>
	);
};

export default BackupsUpsellPage;
