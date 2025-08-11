import { WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import JetpackScanSVG from 'calypso/assets/images/illustrations/jetpack-scan.svg';
import wpcomAtomicTransfer from 'calypso/lib/jetpack/wpcom-atomic-transfer';
import WPCOMScanUpsellPage from 'calypso/my-sites/scan/wpcom-upsell';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function wpcomJetpackScanAtomicTransfer(): ( context: any, next: () => void ) => void {
	return ( context, next ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		// Check if site has scan feature
		const hasScanFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN );

		// If site doesn't have scan feature, show Business plan upsell instead of activation
		if ( ! hasScanFeature ) {
			context.primary = <WPCOMScanUpsellPage />;
			return next();
		}

		// If site has scan feature, proceed with atomic transfer logic
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
		};

		return wpcomAtomicTransfer( WPCOMScanUpsellPage, content )( context, next );
	};
}
