import { PRODUCT_JETPACK_SCAN } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import Upsell from 'calypso/components/jetpack/upsell';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const item = slugToSelectorProduct( PRODUCT_JETPACK_SCAN );
	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_scan_upsell_click' ) ),
		[ dispatch ]
	);

	return (
		<JetpackProductCard
			buttonLabel={ translate( 'Upgrade now' ) }
			buttonPrimary
			buttonURL={ `https://jetpack.com/upgrade/scan/?site=${ selectedSiteSlug }` }
			description={ item.description }
			headerLevel={ 3 }
			hidePrice
			item={ item }
			onButtonClick={ onClick }
		/>
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
		<Main className="scan-upsell">
			<DocumentHead title="Scan" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner Upsell" />
			<div className="scan-upsell__content">{ renderUpsell( reason ) }</div>
		</Main>
	);
}
