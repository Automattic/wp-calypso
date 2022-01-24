export const schema = {
	type: 'object',
	patternProperties: {
		initialOpenSectionId: { type: 'string' },
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
export const SITE_INFO_SECTIONS = {
	siteTitle: 'siteTitle',
	siteDescription: 'siteDescription',
	socialMedia: 'socialMedia',
	contactInfo: 'contactInfo',
};

export const SITE_INFO_FIELDS = {
	siteTitle: 'siteTitle',
	siteDescription: 'siteDescription',
	twitterUrl: 'twitterUrl',
	facebookUrl: 'facebookUrl',
	linkedinUrl: 'linkedinUrl',
	instagramUrl: 'instagramUrl',
	displayEmail: 'displayEmail',
	displayPhone: 'displayPhone',
	displayAddress: 'displayAddress',
};

export type SiteInfo = {
	[ Property in keyof typeof SITE_INFO_FIELDS ]: string;
};
export type SectionsTouchedInfo = {
	[ Property in keyof typeof SITE_INFO_SECTIONS ]: boolean;
};

export const initialState: {
	initialOpenSectionId: string;
	siteInfo: SiteInfo;
	sectionsTouched: SectionsTouchedInfo;
} = {
	initialOpenSectionId: '',
	siteInfo: {
		siteTitle: '',
		siteDescription: '',
		twitterUrl: '',
		facebookUrl: '',
		linkedinUrl: '',
		instagramUrl: '',
		displayEmail: '',
		displayPhone: '',
		displayAddress: '',
	},
	sectionsTouched: {
		siteTitle: false,
		siteDescription: false,
		socialMedia: false,
		contactInfo: false,
	},
};

export type SiteInfoCollectionData = typeof initialState;
