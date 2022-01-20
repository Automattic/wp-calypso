export const schema = {
	type: 'object',
	patternProperties: {
		homePage: { content: 'string', imageUrl1: 'string', imageUrl2: 'string', imageUrl3: 'string' },
		aboutUs: { content: 'string', imageUrl1: 'string', imageUrl2: 'string', imageUrl3: 'string' },
		contactUs: {
			content: 'string',
			imageUrl1: 'string',
			imageUrl2: 'string',
			imageUrl3: 'string',
		},
	},
};

export interface PageData {
	content: string;
	imageUrl1: string;
	imageUrl2: string;
	imageUrl3: string;
}

export interface WebsiteContent {
	homePage: PageData;
	aboutUs: PageData;
	contactUs: PageData;
}

export interface WebsiteContentCollection {
	currentIndex: 0;
	websiteContent: WebsiteContent;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: {
		homePage: {
			content: '',
			imageUrl1: '',
			imageUrl2: '',
			imageUrl3: '',
		},
		aboutUs: {
			content: '',
			imageUrl1: '',
			imageUrl2: '',
			imageUrl3: '',
		},
		contactUs: {
			content: '',
			imageUrl1: '',
			imageUrl2: '',
			imageUrl3: '',
		},
	},
};
