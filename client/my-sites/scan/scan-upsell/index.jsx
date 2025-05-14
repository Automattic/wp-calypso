import { FEATURE_TYPE_JETPACK_SCAN, PRODUCT_JETPACK_SCAN } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import Upsell from 'calypso/components/jetpack/upsell';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

import './style.scss';

function ScanMultisiteBody() {
	const translate = useTranslate();
	return (
		<Upsell
			headerText={ translate( 'Your site does not support Jetpack Scan' ) }
			bodyText={ translate(
				'Jetpack Scan is currently not supported on WordPress multi-site networks.'
			) }
			buttonLink={ false }
			iconComponent={
				<div className="scan-upsell__icon">
					<SecurityIcon icon="info" />
				</div>
			}
		/>
	);
}

function ScanVPActiveBody() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return (
		<Upsell
			headerText={ translate( 'Your site has VaultPress' ) }
			bodyText={ translate(
				'Your site already is protected by VaultPress. You can find a link to your VaultPress dashboard below.'
			) }
			buttonLink="https://dashboard.vaultpress.com/"
			buttonText={ translate( 'Visit Dashboard' ) }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_scan_vaultpress_click' ) ) }
			iconComponent={
				<div className="scan-upsell__icon">
					<img src={ VaultPressLogo } alt="VaultPress logo" />
				</div>
			}
		/>
	);
}

function ScanUpsellBody() {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const dispatch = useDispatch();

	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_scan_upsell_click' ) ),
		[ dispatch ]
	);

	return (
		<>
			<QueryJetpackSaleCoupon />
			<QueryProductsList type="jetpack" />
			{ siteId && <QueryIntroOffers siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<UpsellProductCard
				featureType={ FEATURE_TYPE_JETPACK_SCAN }
				nonManageProductSlug={ PRODUCT_JETPACK_SCAN }
				siteId={ siteId }
				onCtaButtonClick={ onClick }
			/>
		</>
	);
}

function renderUpsell( reason ) {
	switch ( reason ) {
		case 'vp_active_on_site':
			return <ScanVPActiveBody />;
		case 'multisite_not_supported':
			return <ScanMultisiteBody />;
		case 'no_connected_jetpack':
			return <JetpackDisconnected />;
	}
	return <ScanUpsellBody />;
}

export default function ScanUpsellPage( { reason } ) {
	return (
		<Main className="scan-upsell" wideLayout>
			<DocumentHead title="Scan" />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/scan/:site" title="Scanner Upsell" />
			<div className="scan-upsell__content">{ renderUpsell( reason ) }</div>
		</Main>
	);
}
