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
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import Upsell from 'calypso/components/jetpack/upsell';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

function ScanMultisiteBody() {
	const translate = useTranslate();
	return (
		<Upsell
			headerText={ translate( 'Your site does not support Jetpack Scan' ) }
			bodyText={ translate(
				'Jetpack Scan is currently not supported on WordPress multi-site networks.'
			) }
			buttonLink={ false }
			iconComponent={ <SecurityIcon icon="info" /> }
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
			iconComponent={ <SecurityIcon icon="info" /> }
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
			iconComponent={ <SecurityIcon icon="info" /> }
		/>
	);
}

function renderUpsell( reason ) {
	if ( 'multisite_not_supported' === reason ) {
		return <ScanMultisiteBody />;
	}
	if ( 'vp_active_on_site' === reason ) {
		return <ScanVPActiveBody />;
	}
	return <ScanUpsellBody />;
}

export default function ScanUpsellPage( { reason } ) {
	return (
		<Main className="scan">
			<DocumentHead title="Scan" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner Upsell" />
			<div className="scan__content">{ renderUpsell( reason ) }</div>
		</Main>
	);
}
