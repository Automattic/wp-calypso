export const schema = {
	type: 'object',
	patternProperties: {
		currentIndex: { type: 'number' },
		siteTitle: { type: 'string' },
		siteDescription: { type: 'string' },
		twitterUrl: { type: 'string' },
		facebookUrl: { type: 'string' },
		linkedinUrl: { type: 'string' },
		instagramUrl: { type: 'string' },
		displayEmail: { type: 'string' },
		displayPhone: { type: 'string' },
		displayAddress: { type: 'string' },
	},
};

export interface SiteInfoCollectionData {
	siteTitle: string;
	siteDescription: string;
	twitterUrl: string;
	facebookUrl: string;
	linkedinUrl: string;
	instagramUrl: string;
	displayEmail: string;
	displayPhone: string;
	displayAddress: string;
}

export const initialState = {
	currentIndex: 0,
	siteTitle: '',
	siteDescription: '',
	twitterUrl: '',
	facebookUrl: '',
	linkedinUrl: '',
	instagramUrl: '',
	displayEmail: '',
	displayPhone: '',
	displayAddress: '',
};
