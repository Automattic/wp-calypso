import { PRODUCT_JETPACK_BACKUP_T1_YEARLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import Upsell from 'calypso/components/jetpack/upsell';
import { UpsellComponentProps } from 'calypso/components/jetpack/upsell-switch';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { getPurchaseURLCallback } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import ProductCard from 'calypso/my-sites/plans/jetpack-plans/product-card';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

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
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const selectedSiteSlug = useSelector( getSelectedSiteSlug ) || '';
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const createProductURL = getPurchaseURLCallback( selectedSiteSlug, {} );
	const dispatch = useDispatch();

	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_backup_upsell_click' ) ),
		[ dispatch ]
	);
	const item = slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_T1_YEARLY ) as SelectorProduct;

	return (
		<>
			<QueryJetpackSaleCoupon />
			<QueryProductsList type="jetpack" />
			{ siteId && <QueryIntroOffers siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<Upsell
				headerText={ translate( 'Your site does not have backups' ) }
				bodyText={ translate(
					'Get peace of mind knowing your work will be saved, add backups today.'
				) }
				iconComponent={ <BackupsUpsellIcon /> }
			/>
			<ProductCard
				item={ item }
				onClick={ onClick }
				createButtonURL={ createProductURL }
				siteId={ siteId }
				currencyCode={ currencyCode }
				selectedTerm={ TERM_ANNUALLY }
				hideSavingLabel={ false }
			/>
		</>
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
