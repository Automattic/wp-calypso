/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import Upsell from 'calypso/components/jetpack/upsell';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
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
	return (
		<Upsell
			headerText={ translate( 'Your site does not have scan' ) }
			bodyText={ translate(
				'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
			) }
			buttonLink={ `https://wordpress.com/checkout/jetpack_scan/${ selectedSiteSlug }` }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_scan_upsell_click' ) ) }
			iconComponent={
				<div className="scan-upsell__icon">
					<SecurityIcon icon="info" />
				</div>
			}
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
