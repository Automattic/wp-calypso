import type { SiteId } from 'calypso/types';
export const schema = {
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Website content schema',
	type: 'object',
	additionalProperties: false,
	required: [ 'currentIndex', 'websiteContent', 'imageUploadStates' ],
	properties: {
		currentIndex: {
			type: 'number',
			description: 'The current position in the form index',
		},
		websiteContent: {
			type: 'object',
			description: 'The content for the website',
			additionalProperties: false,
			required: [ 'pages', 'siteLogoSection', 'feedbackSection' ],
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
				siteLogoSection: {
					type: 'object',
					description: 'Props related to Uploading logo url',
					additionalProperties: false,
					required: [ 'siteLogoUrl' ],
					properties: {
						siteLogoUrl: {
							type: 'string',
							description: 'Uploaded Logo url',
						},
					},
				},
				feedbackSection: {
					type: 'object',
					description: 'Props related to generating feedback',
					additionalProperties: false,
					required: [ 'genericFeedback' ],
					properties: {
						genericFeedback: {
							type: 'string',
							description: 'General feedback provided about the site',
						},
					},
				},
			},
		},
		imageUploadStates: {
			type: 'object',
		},
		siteId: {
			type: [ 'number', 'null' ],
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

export type WebsiteContent = {
	pages: Array< PageData >;
	siteLogoSection: { siteLogoUrl: string };
	feedbackSection: { genericFeedback: string };
};
export interface WebsiteContentCollection {
	currentIndex: number;
	websiteContent: WebsiteContent;
	imageUploadStates: Record< string, Record< string, string > >;
	siteId: SiteId | null;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: {
		pages: [],
		siteLogoSection: { siteLogoUrl: '' },
		feedbackSection: { genericFeedback: '' },
	},
	imageUploadStates: {},
	siteId: null,
};
