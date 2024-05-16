import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';

/**
 * Returns hosting name and description with given product slug.
 * @param slug
 * @returns
 */
export default function useHostingDescription( slug: string ): {
	name: TranslateResult;
	description: TranslateResult;
	heading: TranslateResult;
	features: TranslateResult[];
	footerText: TranslateResult;
} {
	const translate = useTranslate();

	return useMemo( () => {
		let description = '';
		let name = '';
		let heading = '';
		let features: TranslateResult[] = [];
		let footerText: TranslateResult = '';

		switch ( slug ) {
			case 'pressable-hosting':
				name = translate( 'Pressable' );
				heading = translate( 'Premier Agency Hosting w/ WooCommerce' );
				description = translate(
					'Premier agency hosting for large-scale businesses and major eCommerce.'
				);
				features = [
					translate( 'Optimized for high-traffic WooCommerce stores {{img/}}', {
						components: {
							img: <WooCommerceLogo size={ 32 } />,
						},
					} ),
					translate( '24/7 Expert Support with expanded support options' ),
					translate( '20GB-1TB Storage' ),
					translate( '100% uptime SLA' ),
					translate( 'Custom pricing and packaging are available' ),
					translate( 'Agency tools to manage sites at scale' ),
				];
				footerText = translate( 'WP.Cloud powered hosting by' );
				break;
			case 'wpcom-hosting':
				name = translate( 'WordPress.com' );
				heading = translate( 'Standard Agency Hosting' );
				description = translate(
					'Optimized and hassle-free hosting for business websites, local merchants, and small online retailers.'
				);
				features = [
					translate( 'Great for developers with client-managed sites.' ),
					translate( '24/7 Expert Support' ),
					translate( '50 GB Storage' ),
					translate( 'Unmetered Visits' ),
					translate( 'Self-service sales' ),
					translate( 'Studio (local dev)' ),
				];
				footerText = translate( 'WP.Cloud powered hosting by' );
				break;
			case 'vip':
				name = translate( 'VIP' );
				heading = translate( 'Enterprise CMS' );
				description = translate(
					'Deliver unmatched performance with the highest security standards on our enterprise content platform.'
				);
				features = [
					translate( 'Unmatched flexibility to build a customized web experience' ),
					translate( 'Tools to increase customer engagement' ),
					translate(
						'Scalability to ensure top-notch site performance during campaigns or events'
					),
				];
				footerText = translate( 'Enterprise WordPress hosting by' );
				break;
		}

		return {
			name,
			heading,
			description,
			features,
			footerText,
		};
	}, [ slug, translate ] );
}
