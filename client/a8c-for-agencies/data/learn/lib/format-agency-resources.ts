import type { APIAgencyResource } from '../types';
import type { ResourceItem } from 'calypso/a8c-for-agencies/sections/learn/resource-center/overview-content/types';

/**
 * Transform API response format (snake_case) to app format (camelCase)
 */
export function formatAgencyResource( resource: APIAgencyResource ): ResourceItem {
	return {
		// Generate a unique ID from the resource name and type
		id: `${ resource.related_product }-${ resource.resource_type }-${ resource.name
			.toLowerCase()
			.replace( /\s+/g, '-' ) }`,
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
		// Use name as title by default
		title: resource.name,
		// Set CTA to external URL with default label
		cta: {
			label: resource.format === 'video' ? 'Watch' : 'Learn more',
			url: resource.external_url,
		},
	};
}

/**
 * Format array of agency resources
 */
export function formatAgencyResources( resources: APIAgencyResource[] ): ResourceItem[] {
	return resources.map( formatAgencyResource );
}
