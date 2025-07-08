import { translate } from 'i18n-calypso';
import JetpackScanSVG from 'calypso/assets/images/illustrations/jetpack-scan.svg';
import wpcomAtomicTransfer from 'calypso/lib/jetpack/wpcom-atomic-transfer';
import WPCOMScanUpsellPage from 'calypso/my-sites/scan/wpcom-upsell';

export function wpcomJetpackScanAtomicTransfer() {
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

	return wpcomAtomicTransfer( WPCOMScanUpsellPage, content );
}
