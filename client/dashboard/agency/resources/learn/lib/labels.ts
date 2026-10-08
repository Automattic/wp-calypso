import { __ } from '@wordpress/i18n';
import type {
	AgencyResourceAudience,
	AgencyResourceContentType,
	AgencyResourceFormat,
	AgencyResourceProduct,
	AgencyResourceStage,
} from '@automattic/api-core';

/**
 * Display labels for the v2 taxonomy slugs. The API is not validated against
 * the slug unions at runtime, so every lookup falls back to the slug itself.
 */

const PRODUCT_LABELS: Record< AgencyResourceProduct, string > = {
	'automattic-for-agencies': 'Automattic for Agencies',
	jetpack: 'Jetpack',
	pressable: 'Pressable',
	woocommerce: 'WooCommerce',
	'wordpress-com': 'WordPress.com',
	'wordpress-org': 'WordPress.org',
	'wordpress-vip': 'WordPress VIP',
};

export function getProductLabel( product: AgencyResourceProduct ): string {
	return PRODUCT_LABELS[ product ] ?? product;
}

export function getContentTypeLabel( contentType: AgencyResourceContentType ): string {
	const labels: Record< AgencyResourceContentType, string > = {
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

export function getStageLabel( stage: AgencyResourceStage ): string {
	const labels: Record< AgencyResourceStage, string > = {
		learn: __( 'Learn' ),
		sell: __( 'Sell' ),
		manage: __( 'Manage' ),
		grow: __( 'Grow' ),
	};

	return labels[ stage ] ?? stage;
}

export function getAudienceLabel( audience: AgencyResourceAudience ): string {
	const labels: Record< AgencyResourceAudience, string > = {
		all: __( 'All audiences' ),
		developer: __( 'Developers' ),
		business: __( 'Business' ),
		client: __( 'Clients' ),
	};

	return labels[ audience ] ?? audience;
}

export function getFormatLabel( format: AgencyResourceFormat ): string {
	const labels: Record< AgencyResourceFormat, string > = {
		pdf: __( 'PDF' ),
		slides: __( 'Slides' ),
		video: __( 'Video' ),
		doc: __( 'Document' ),
		webpage: __( 'Webpage' ),
	};

	return labels[ format ] ?? format;
}
