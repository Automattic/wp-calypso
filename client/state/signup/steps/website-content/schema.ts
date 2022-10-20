export const schema = {
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Website content schema',
	type: 'object',
	required: [ 'currentIndex', 'websiteContent' ],
	properties: {
		currentIndex: {
			type: 'number',
			description: 'The current position in the form index',
		},
		websiteContent: {
			type: 'object',
			description: 'The content for the website',
			properties: {
				pages: {
					type: 'array',
					description: 'The individual page content for the website',

					items: {
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
									type: 'object',
									properties: {
										caption: { type: 'string' },
										url: { type: 'string' },
									},
								},
							},
						},
					},
				},
				siteLogoUrl: {
					type: 'string',
					description: 'Uploaded Logot url',
				},
			},
		},
		imageUploadStates: {
			type: 'object',
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

export interface ContactPageData extends PageData {
	displayEmail?: string;
	displayPhone?: string;
	displayAddress?: string;
}

export type WebsiteContent = { pages: Array< PageData >; siteLogoUrl: string };
export interface WebsiteContentCollection {
	currentIndex: number;
	websiteContent: WebsiteContent;
	imageUploadStates: Record< string, Record< string, string > >;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: { pages: [], siteLogoUrl: '' },
	imageUploadStates: {},
};
