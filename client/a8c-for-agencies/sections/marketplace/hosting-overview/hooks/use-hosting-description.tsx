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
	features: TranslateResult[];
} {
	const translate = useTranslate();

	return useMemo( () => {
		let description = '';
		let name = '';
		let features: TranslateResult[] = [];

		switch ( slug ) {
			case 'pressable-hosting':
				name = translate( 'Pressable' );
				description = translate(
					'Best for premier agencies and developers who need significant control and build sites that require scaling.'
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
				break;
			case 'wpcom-hosting':
				name = translate( 'WordPress.com' );
				description = translate( 'Best for those who want a hassle-free WordPress experience.' );
				features = [
					translate( 'Great for developers with client-managed sites.' ),
					translate( '24/7 Expert Support' ),
					translate( '50 GB Storage' ),
					translate( 'Unmetered Visits' ),
					translate( 'Self-service sales' ),
					translate( 'Studio (local dev)' ),
				];
				break;
			case 'vip':
				name = translate( 'VIP' );
				description = translate(
					'Deliver unmatched performance with the highest security standards on our enterprise content platform.'
				);
				features = [];
		}

		return {
			name,
			description,
			features,
		};
	}, [ slug, translate ] );
}
