import JetpackLogo from '../../marketplace/exclusive-offers/images/jetpack.svg';
import PressableLogo from '../../marketplace/exclusive-offers/images/pressable.svg';
import VIPLogo from '../../marketplace/exclusive-offers/images/vip.svg';
import WooLogo from '../../marketplace/exclusive-offers/images/woo.svg';
import WordPressDotComLogo from '../../marketplace/exclusive-offers/images/wordpressdotcom.svg';
import type { ResourceItem } from './types';
import type { AgencyResource } from '@automattic/api-core';
import type { ReactNode } from 'react';

/**
 * Get logo element based on related product.
 */
function getProductLogo( relatedProduct: string ): ReactNode | null {
	const logos: Record< string, { src: string; alt: string } > = {
		woocommerce: { src: WooLogo, alt: 'WooCommerce' },
		jetpack: { src: JetpackLogo, alt: 'Jetpack' },
		pressable: { src: PressableLogo, alt: 'Pressable' },
		'wordpress.com': { src: WordPressDotComLogo, alt: 'WordPress.com' },
		'wordpress vip': { src: VIPLogo, alt: 'WordPress VIP' },
	};

	const logo = logos[ relatedProduct.toLowerCase() ];

	if ( ! logo ) {
		return null;
	}

	return <img src={ logo.src } alt={ logo.alt } style={ { width: 'auto', height: '16px' } } />;
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
		logo: getProductLogo( resource.related_product ),
	};
}

export function formatAgencyResources( resources: AgencyResource[] ): ResourceItem[] {
	return resources.map( formatAgencyResource );
}
