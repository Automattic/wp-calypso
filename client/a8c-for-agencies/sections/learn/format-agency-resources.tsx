import JetpackLogo from 'calypso/a8c-for-agencies/sections/exclusive-offers/overview-content/images/jetpack.svg';
import PressableLogo from 'calypso/a8c-for-agencies/sections/exclusive-offers/overview-content/images/pressable.svg';
import VIPLogo from 'calypso/a8c-for-agencies/sections/exclusive-offers/overview-content/images/vip.svg';
import WooLogo from 'calypso/a8c-for-agencies/sections/exclusive-offers/overview-content/images/woo.svg';
import WordPressDotComLogo from 'calypso/a8c-for-agencies/sections/exclusive-offers/overview-content/images/wordpressdotcom.svg';
import type { APIAgencyResource } from 'calypso/a8c-for-agencies/data/learn/types';
import type { ResourceItem } from 'calypso/a8c-for-agencies/sections/learn/resource-center/overview-content/types';

/**
 * Get logo JSX element based on related product
 */
function getProductLogo( relatedProduct: string ): JSX.Element | null {
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
 * Transform API response format (snake_case) to app format (camelCase)
 */
export function formatAgencyResource( resource: APIAgencyResource ): ResourceItem {
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

/**
 * Format array of agency resources
 */
export function formatAgencyResources( resources: APIAgencyResource[] ): ResourceItem[] {
	return resources.map( formatAgencyResource );
}
