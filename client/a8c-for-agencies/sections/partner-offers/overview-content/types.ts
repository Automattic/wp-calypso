export type PartnerOffer = {
	id: string;
	type?: string;
	offerType: string;
	product: string;
	productType: string;
	category: string;
	logo: string;
	title: string;
	description: string;
	cta: {
		label: string;
		url: string;
	};
};
