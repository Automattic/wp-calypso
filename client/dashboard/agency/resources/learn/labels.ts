import { __ } from '@wordpress/i18n';

/**
 * Display labels for the v2 taxonomy slugs. The API is not validated against
 * the slug unions at runtime, so every lookup falls back to the slug itself.
 */

const PRODUCT_LABELS: Record< string, string > = {
	'automattic-for-agencies': 'Automattic for Agencies',
	jetpack: 'Jetpack',
	pressable: 'Pressable',
	woocommerce: 'WooCommerce',
	'wordpress-com': 'WordPress.com',
	'wordpress-vip': 'WordPress VIP',
};

export function getProductLabel( product: string ): string {
	return PRODUCT_LABELS[ product ] ?? product;
}

export function getContentTypeLabel( contentType: string ): string {
	const labels: Record< string, string > = {
		'battle-card': __( 'Battle card' ),
		blog: __( 'Blog' ),
		'case-study': __( 'Case study' ),
		checklist: __( 'Checklist' ),
		guide: __( 'Guide' ),
		'one-pager': __( 'One-pager' ),
		'process-guide': __( 'Process guide' ),
		'reference-guide': __( 'Reference guide' ),
		'slide-deck': __( 'Slide deck' ),
		'talk-track': __( 'Talk track' ),
		webinar: __( 'Webinar' ),
	};

	return labels[ contentType ] ?? contentType;
}
