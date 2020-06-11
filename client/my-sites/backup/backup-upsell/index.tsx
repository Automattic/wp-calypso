/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Upsell from 'components/jetpack/upsell';
import { UpsellComponentProps } from 'components/jetpack/upsell-switch';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const BackupsUpsellIcon: FunctionComponent = () => (
	<div className="backup-upsell__icon-header">
		<img
			src="/calypso/images/illustrations/jetpack-cloud-backup-error.svg"
			alt="jetpack cloud backup error"
		/>
	</div>
);

const BackupsVPActiveBody: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return (
		<Upsell
			headerText={ translate( 'Your site has VaultPress' ) }
			bodyText={ translate(
				'Your site is already backed up by VaultPress. You can find a link to your VaultPress dashboard below.'
			) }
			buttonLink="https://dashboard.vaultpress.com/"
			buttonText={ translate( 'Visit Dashboard' ) }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_vaultpress_click' ) ) }
			iconComponent={ <BackupsUpsellIcon /> }
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

const BackupsUpsellPage: FunctionComponent< UpsellComponentProps > = ( { reason } ) => (
	<Main className="backup-upsell">
		<DocumentHead title="Backup" />
		<SidebarNavigation />
		<div className="backup-upsell__content">
			{ 'vp_active_on_site' === reason ? <BackupsVPActiveBody /> : <BackupsUpsellBody /> }
		</div>
	</Main>
);

export default BackupsUpsellPage;
