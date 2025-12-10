export type ResourceItem = {
	id: string;
	type?: string;
	resourceType: string;
	product: string;
	productType?: string;
	logo: JSX.Element;
	title: string;
	description: string;
	cta: {
		label: string;
		url: string;
	};
};
