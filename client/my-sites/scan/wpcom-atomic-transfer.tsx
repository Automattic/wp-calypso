import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import JetpackScanSVG from 'calypso/assets/images/illustrations/jetpack-scan.svg';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import FormattedHeader from 'calypso/components/formatted-header';
import WPCOMBusinessAT from 'calypso/components/jetpack/wpcom-business-at';
import Main from 'calypso/components/main';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import WPCOMScanUpsellPage from 'calypso/my-sites/scan/wpcom-upsell';
import { useDispatch } from 'calypso/state';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import getSiteScanRequestStatus from 'calypso/state/selectors/get-site-scan-request-status';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

// Loading placeholder component
const ScanLoadingPlaceholder = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	return (
		<Main className="business-at-switch__loading">
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			<QueryJetpackScan siteId={ siteId } />
			<FormattedHeader
				id="wpcom-scan-loading"
				className="business-at-switch placeholder__header"
				headerText={ translate( 'Loading…' ) }
				align="left"
			/>
			<div className="business-at-switch placeholder__primary-promo"></div>
		</Main>
	);
};

// Wrapper component that handles the feature loading logic
const ScanAtomicTransferWrapper = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const dispatch = useDispatch();

	const featuresNotLoaded: boolean = useSelector(
		( state: AppState ) =>
			null === getFeaturesBySiteId( state, siteId ) && ! isRequestingSiteFeatures( state, siteId )
	);

	const scanDataNotLoaded: boolean = useSelector(
		( state: AppState ) =>
			! getSiteScanState( state, siteId ) &&
			( isRequestingJetpackScan( state, siteId ) ||
				getSiteScanRequestStatus( state, siteId ) === 'pending' )
	);

	// Check if site has scan feature - must be called unconditionally
	const hasScanFeature = useSelector( ( state: AppState ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);

	// Get scan state to determine if activation is needed
	const scanState = useSelector( ( state: AppState ) => getSiteScanState( state, siteId ) );

	// If features or scan data are not loaded yet, show loading state
	if ( featuresNotLoaded || scanDataNotLoaded ) {
		return <ScanLoadingPlaceholder />;
	}

	// If site doesn't have scan feature, show Business plan upsell instead of activation
	if ( ! hasScanFeature ) {
		return <WPCOMScanUpsellPage />;
	}

	// If scan is already working (not 'unavailable'), let the normal flow continue
	// This means we should NOT show the atomic transfer UI
	if ( scanState && scanState.state !== 'unavailable' ) {
		// Return null to let the normal scan page show through the middleware chain
		return null;
	}

	// If scan state is 'unavailable' and site has scan feature, show atomic transfer activation
	const content = {
		documentHeadTitle: translate( 'Activate Jetpack Scan now' ) as string,
		header: translate( 'Jetpack Scan' ) as string,
		primaryPromo: {
			title: translate( 'We guard your site. You run your business.' ),
			image: { path: JetpackScanSVG },
			content: translate(
				'Scan gives you automated scanning and one-click fixes to keep your site ahead of security threats.'
			),
			promoCTA: {
				text: translate( 'Activate Jetpack Scan now' ),
				loadingText: translate( 'Activating Jetpack Scan' ),
			},
		},

		getProductUrl: ( siteSlug: string ) => `/scan/${ siteSlug }`,
		onActivationResolved: () => {
			dispatch( requestScanStatus( siteId ) );
		},
	};

	// Render the atomic transfer UI with the scan-specific content
	return <WPCOMBusinessAT content={ content } />;
};

// Wrapper component that conditionally renders atomic transfer logic
const ConditionalScanAtomicTransferWrapper = ( { children }: { children: React.ReactNode } ) => {
	const wrapperContent = ScanAtomicTransferWrapper();

	// If wrapper returns null, render the children (normal scan page)
	// Otherwise render the wrapper content (loading, upsell, or atomic transfer)
	return wrapperContent || children;
};

export function wpcomJetpackScanAtomicTransfer(): ( context: any, next: () => void ) => void {
	const WPCOMJetpackScanAtomicTransfer = ( context: any, next: () => void ) => {
		if ( isJetpackCloud() || isA8CForAgencies() ) {
			return next();
		}

		// Wrap the existing primary component with conditional logic
		// This ensures proper React re-rendering when features are loaded
		const originalPrimary = context.primary;
		context.primary = (
			<ConditionalScanAtomicTransferWrapper>
				{ originalPrimary }
			</ConditionalScanAtomicTransferWrapper>
		);
		return next();
	};

	WPCOMJetpackScanAtomicTransfer.displayName = 'WPCOMJetpackScanAtomicTransfer';
	return WPCOMJetpackScanAtomicTransfer;
}
