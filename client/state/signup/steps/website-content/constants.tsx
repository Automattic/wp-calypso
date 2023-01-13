import { WebsiteContentCollectionState } from './types';

export const LOGO_SECTION_ID = 'logo_section';

export const MEDIA_UPLOAD_STATES = {
	UPLOAD_STARTED: 'UPLOAD_STARTED',
	UPLOAD_COMPLETED: 'UPLOAD_COMPLETED',
	UPLOAD_FAILED: 'UPLOAD_FAILED',
	UPLOAD_REMOVED: 'UPLOAD_REMOVED',
};

export const initialState: WebsiteContentCollectionState = {
	currentIndex: 0,
	websiteContent: {
		pages: [],
		siteLogoSection: { siteLogoUrl: '' },
		feedbackSection: { genericFeedback: '' },
	},
	mediaUploadStates: {},
};
