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
					'Best for developers and agencies who need advanced hosting controls and management tools.'
				);
				features = [
					translate( 'Optimized for high-traffic WooCommerce stores {{img/}}', {
						components: {
							img: <WooCommerceLogo size={ 32 } />,
						},
					} ),
					translate( '100% uptime SLA' ),
					translate( 'Great for teams with granular permission needs' ),
					translate( 'Tooling to help you manage sites at scale with one-click config options' ),
					translate( 'White-label tools for agencies' ),
					translate(
						'Partner sales concierge to assist with custom plans and complex purchasing requirements'
					),
					translate( 'Multiple support channels: Email, web chat, and Slack.' ),
					translate( 'Decoupled (headless) support' ),
				];
				break;
			case 'wpcom-hosting':
				name = translate( 'WordPress.com' );
				description = translate(
					'Best for those who want optimized, hassle-free WordPress hosting.'
				);
				features = [
					translate( 'Great for developers with client-managed sites' ),
					translate( 'Unlimited visits' ),
					translate( '50GB storage' ),
					translate( 'Self-service sales' ),
					translate( 'Local development environment, Studio' ),
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
