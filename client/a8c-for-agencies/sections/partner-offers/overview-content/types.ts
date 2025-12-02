export type PartnerOffer = {
	id: string;
	type?: string;
	offerType: string;
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
