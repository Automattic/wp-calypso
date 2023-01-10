import type { PageId } from 'calypso/signup/difm/constants';
import type { SiteId } from 'calypso/types';

export const schema = {
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Website content schema',
	type: 'object',
	additionalProperties: false,
	required: [ 'currentIndex', 'websiteContent', 'mediaUploadStates' ],
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
							media: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										caption: { type: 'string' },
										url: { type: 'string' },
										thumbnailUrl: { type: 'string' },
										uploadID: { type: 'number' },
										mediaType: { type: 'string' },
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
		mediaUploadStates: {
			type: 'object',
		},
		siteId: {
			type: [ 'number', 'null' ],
			description: 'The siteId of the stored website content',
		},
	},
};
export const LOGO_SECTION_ID = 'logo_section';

export const MEDIA_UPLOAD_STATES = {
	UPLOAD_STARTED: 'UPLOAD_STARTED',
	UPLOAD_COMPLETED: 'UPLOAD_COMPLETED',
	UPLOAD_FAILED: 'UPLOAD_FAILED',
	UPLOAD_REMOVED: 'UPLOAD_REMOVED',
};
export type MediaUploadType = 'IMAGE' | 'VIDEO';

export type Media = {
	caption?: string;
	url: string;
	mediaType: MediaUploadType;
	thumbnailUrl?: string;
	uploadID?: string;
};

export interface PageData {
	id: PageId;
	title: string;
	content: string;
	media: Array< Media >;
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
	mediaUploadStates: Record< string, Record< string, string > >;
	siteId: SiteId | null;
}

export const initialState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: {
		pages: [],
		siteLogoSection: { siteLogoUrl: '' },
		feedbackSection: { genericFeedback: '' },
	},
	mediaUploadStates: {},
	siteId: null,
};
