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
	// Computed field
	logo: JSX.Element | null;
};
