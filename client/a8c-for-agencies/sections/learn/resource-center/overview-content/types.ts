export type ResourceItem = {
	id: string;
	name: string;
	description: string;
	externalUrl: string;
	format: string;
	relatedProduct: string;
	relatedProductType: string;
	resourceType: string;
	previewImage: string;
	section: string;
	createdAt: string;
	updatedAt: string;
	// UI-specific fields (computed from API data)
	logo?: JSX.Element;
	title?: string;
	cta?: {
		label: string;
		url: string;
	};
};
