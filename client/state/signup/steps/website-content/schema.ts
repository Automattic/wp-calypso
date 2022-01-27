export const schema = {
	type: 'object',
	properties: {
		currentIndex: 'number',
		websiteContent: {
			type: 'array',
			items: { $ref: '#/$defs/pageData' },
		},
		$defs: {
			pageData: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
					},
					title: {
						type: 'string',
					},
					content: {
						type: 'string',
					},
					images: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
				},
			},
		},
	},
};

export interface ImageData {
	caption: string;
	url: string;
	uploadID?: string;
}

export interface PageData {
	id: string;
	title: string;
	content: string;
	images: Array< ImageData >;
}

export type WebsiteContent = Array< PageData >;
export interface WebsiteContentCollection {
	currentIndex: number;
	websiteContent: WebsiteContent;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: [],
};

export const initialTestState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: [
		{
			id: 'Home',
			title: 'Homepage',
			content: '',
			images: [
				{ caption: '', url: '' },
				{ caption: '', url: '' },
				{ caption: '', url: '' },
			],
		},
		{
			id: 'About',
			title: 'Information About You',
			content: '',
			images: [
				{ caption: '', url: '' },
				{ caption: '', url: '' },
				{ caption: '', url: '' },
			],
		},
		{
			id: 'Contact',
			title: 'Contact Info',
			content: '',
			images: [
				{ caption: '', url: '' },
				{ caption: '', url: '' },
				{ caption: '', url: '' },
			],
		},
	],
};
