import { __ } from '@wordpress/i18n';
import JetpackLogo from '../../marketplace/exclusive-offers/images/jetpack-descriptor.svg';
import PressableLogo from '../../marketplace/exclusive-offers/images/pressable-descriptor.svg';
import VIPLogo from '../../marketplace/exclusive-offers/images/vip-descriptor.svg';
import WooLogo from '../../marketplace/exclusive-offers/images/woo-descriptor.svg';
import WordPressDotComLogo from '../../marketplace/exclusive-offers/images/wordpressdotcom-descriptor.svg';
import AgencyHabitsLogo from './images/agencyhabits.png';
import WordPressLogo from './images/wordpress.png';
import type { ResourceItem } from './types';
import type {
	AgencyEnablementResource,
	AgencyResource,
	AgencyResourceFormat,
	AgencyResourceProduct,
} from '@automattic/api-core';
import type { ReactNode } from 'react';

interface Logo {
	src: string;
	alt: string;
	height?: number;
}

const LOGO_HEIGHT = 24;

// A bare wordmark, not an icon lockup, so it needs its own height to match the cap height.
const AgencyHabits: Logo = { src: AgencyHabitsLogo, alt: 'AgencyHabits', height: 15 };

/**
 * Resources the API leaves unattributed still have a destination, so fall back to
 * the publisher. Matched on hostname rather than the whole URL, because the
 * campaign parameters also contain the publisher name.
 */
function getPublisherLogo( externalUrl: string ): Logo | null {
	let hostname = '';

	try {
		hostname = new URL( externalUrl ).hostname.toLowerCase();
	} catch {
		return null;
	}

	return hostname.includes( 'agencyhabits' ) ? AgencyHabits : null;
}

/**
 * Get logo element based on related product.
 */
function getProductLogo( relatedProduct = '', externalUrl = '' ): ReactNode | null {
	const logos: Record< string, Logo > = {
		woocommerce: { src: WooLogo, alt: 'WooCommerce' },
		jetpack: { src: JetpackLogo, alt: 'Jetpack' },
		pressable: { src: PressableLogo, alt: 'Pressable' },
		'wordpress.com': { src: WordPressDotComLogo, alt: 'WordPress.com' },
		'wordpress vip': { src: VIPLogo, alt: 'WordPress VIP' },
		wordpress: { src: WordPressLogo, alt: 'WordPress' },
	};

	const logo = logos[ relatedProduct.toLowerCase() ] ?? getPublisherLogo( externalUrl );

	if ( ! logo ) {
		return null;
	}

	const height = logo.height ?? LOGO_HEIGHT;

	return (
		<img
			src={ logo.src }
			alt={ logo.alt }
			style={ {
				width: 'auto',
				height: `${ height }px`,
				marginBlock: `${ ( LOGO_HEIGHT - height ) / 2 }px`,
			} }
		/>
	);
}

/**
 * Transform API response format (snake_case) to app format (camelCase).
 */
export function formatAgencyResource( resource: AgencyResource ): ResourceItem {
	return {
		id: resource.id,
		name: resource.name,
		description: resource.description,
		externalUrl: resource.external_url,
		format: resource.format,
		relatedProduct: resource.related_product,
		relatedProductType: resource.related_product_type,
		resourceType: resource.resource_type,
		previewImage: resource.preview_image,
		section: resource.section,
		createdAt: resource.created_at,
		updatedAt: resource.updated_at,
		logo: getProductLogo( resource.related_product, resource.external_url ),
	};
}

export function formatAgencyResources( resources: AgencyResource[] ): ResourceItem[] {
	return resources.map( formatAgencyResource );
}

/**
 * v2 slugs mapped to the v1 display strings, which the logo lookup and the
 * card's call-to-action still key on.
 */
const PRODUCT_NAMES: Record< AgencyResourceProduct, string > = {
	'automattic-for-agencies': 'Automattic for Agencies',
	jetpack: 'Jetpack',
	pressable: 'Pressable',
	woocommerce: 'WooCommerce',
	'wordpress-com': 'WordPress.com',
	'wordpress-vip': 'WordPress VIP',
};

const FORMAT_NAMES: Record< AgencyResourceFormat, string > = {
	pdf: 'PDF',
	slides: 'Slide Deck',
	video: 'Video',
	doc: 'Doc',
	webpage: 'Webpage',
};

function getContentTypeLabel( contentType: string ): string {
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

export function formatAgencyEnablementResource( resource: AgencyEnablementResource ): ResourceItem {
	const relatedProduct = PRODUCT_NAMES[ resource.product ] ?? resource.product;

	return {
		id: resource.id,
		name: resource.name,
		description: resource.description,
		externalUrl: resource.external_url,
		format: FORMAT_NAMES[ resource.format ] ?? resource.format,
		relatedProduct,
		relatedProductType: '',
		resourceType: getContentTypeLabel( resource.content_type ),
		previewImage: '',
		section: resource.is_featured ? 'top-resources' : '',
		stage: resource.stage,
		createdAt: resource.created_at,
		updatedAt: resource.updated_at,
		logo: getProductLogo( relatedProduct, resource.external_url ),
	};
}

export function formatAgencyEnablementResources(
	resources: AgencyEnablementResource[]
): ResourceItem[] {
	return resources.map( formatAgencyEnablementResource );
}
