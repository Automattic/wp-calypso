import { PRODUCT_JETPACK_BACKUP_T1_YEARLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import Upsell from 'calypso/components/jetpack/upsell';
import { UpsellComponentProps } from 'calypso/components/jetpack/upsell-switch';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
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

	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_backup_upsell_click' ) ),
		[ dispatch ]
	);
	const item = slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_T1_YEARLY ) as SelectorProduct;

	return (
		<JetpackProductCard
			buttonLabel={ translate( 'Upgrade now' ) }
			buttonPrimary
			buttonURL={ `https://jetpack.com/upgrade/backup/?site=${ selectedSiteSlug }` }
			description={ item.description }
			headerLevel={ 3 }
			hidePrice
			item={ item }
			onButtonClick={ onClick }
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
