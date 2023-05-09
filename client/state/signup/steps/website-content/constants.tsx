import { WebsiteContentCollectionState } from './types';

export const SITE_INFORMATION_SECTION_ID = 'site_information_section';

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
		siteInformationSection: { siteLogoUrl: '', searchTerms: '' },
		feedbackSection: { genericFeedback: '' },
	},
	mediaUploadStates: {},
	hasUnsavedChanges: false,
};
