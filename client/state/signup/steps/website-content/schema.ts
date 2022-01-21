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

export interface PageData {
	title: string;
	content: string;
	images: Array< string >;
}

export type WebsiteContent = Array< PageData >;
export interface WebsiteContentCollection {
	currentIndex: number;
	websiteContent: WebsiteContent;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: [
		{
			title: 'Home',
			content: '',
			images: [],
		},
		{
			title: 'About',
			content: '',
			images: [],
		},
		{
			title: 'Contact',
			content: '',
			images: [],
		},
	],
};
