/**
 * API Response types for agency resources endpoint
 */

export interface APIAgencyResource {
	id: number;
	name: string;
	description: string;
	external_url: string;
	format: string;
	related_product: string;
	related_product_type: string;
	resource_type: string;
	preview_image: string;
	section: string;
	created_at: string;
	updated_at: string;
}

export interface APIAgencyResourcesResponse {
	status: string;
	results: APIAgencyResource[];
	total: number;
}
