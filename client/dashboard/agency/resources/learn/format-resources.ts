import type { ResourceItem } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

/**
 * Transform API response format (snake_case) to app format (camelCase).
 */
export function formatAgencyResource( resource: AgencyEnablementResource ): ResourceItem {
	return {
		id: resource.id,
		name: resource.name,
		description: resource.description,
		externalUrl: resource.external_url,
		product: resource.product,
		stage: resource.stage,
		audience: resource.audience,
		contentType: resource.content_type,
		format: resource.format,
		isFeatured: resource.is_featured,
		createdAt: resource.created_at,
		updatedAt: resource.updated_at,
	};
}

export function formatAgencyResources( resources: AgencyEnablementResource[] ): ResourceItem[] {
	return resources.map( formatAgencyResource );
}
