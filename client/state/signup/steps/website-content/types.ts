import type { Design } from '@automattic/design-picker';
import type { PageId } from 'calypso/signup/difm/constants';

export type MediaUploadType = 'IMAGE' | 'VIDEO' | 'IMAGE-AND-VIDEO';

export type Media = {
	caption?: string;
	url: string;
	mediaType: MediaUploadType;
	thumbnailUrl?: string;
	uploadID?: string;
};

/** One selected page instance, identified by an opaque UUID `id` and its canonical `type`. */
export type SelectedPageInstance = { id: string; type: PageId; title?: string };

export type PageData = {
	id: string; // opaque instance id (UUID)
	type: PageId; // canonical page type
	title: string;
	content: string;
	useFillerContent: boolean;
	media: Array< Media >;
};

export interface ContactPageData extends PageData {
	displayEmail?: string;
	displayPhone?: string;
	displayAddress?: string;
}

/** Server-returned page payload. Lacks `type` — the frontend reconstructs it from the instance/title. */
export type ServerPageData = Omit< PageData, 'type' > & {
	displayEmail?: string;
	displayPhone?: string;
	displayAddress?: string;
};

export type WebsiteContent = {
	pages: Array< PageData >;
	siteInformationSection: { siteLogoUrl: string; searchTerms: string };
	feedbackSection: { genericFeedback: string };
};

export interface DIFMDependencies {
	newOrExistingSiteChoice: boolean;
	siteTitle: string;
	siteDescription: string;
	tagline: string;
	searchTerms: string;
	selectedDesign: Pick< Design, 'theme' >;
	selectedSiteCategory: string;
	isLetUsChooseSelected: boolean;
	twitterUrl: string;
	facebookUrl: string;
	linkedinUrl: string;
	instagramUrl: string;
	displayEmail: string;
	displayPhone: string;
	displayAddress: string;
	selectedPageTitles: string[];
	selectedPageInstances?: SelectedPageInstance[];
	isStoreFlow: boolean;
}

/**
 * Type for the local redux state
 */
export interface WebsiteContentCollectionState {
	currentIndex: number;
	websiteContent: WebsiteContent;
	mediaUploadStates: Record< string, Record< string, string > >;
	hasUnsavedChanges: boolean;
}

export type WebsiteContentRequestDTO = {
	pages: Record< string, any >;
	site_logo_url: string;
	generic_feedback: string;
	search_terms: string;
};

export type WebsiteContentResponseDTO = WebsiteContentRequestDTO & {
	selected_page_titles: PageId[];
	selected_page_instances?: Array< { id: string; type: PageId; title?: string } >;
	is_website_content_submitted: boolean;
	is_store_flow: boolean;
};

/**
 * Type for the server state.
 * This is essentially the camelCase version of WebsiteContentResponseDTO
 */
export type WebsiteContentServerState = {
	selectedPageTitles: PageId[];
	selectedPageInstances?: SelectedPageInstance[];
	isWebsiteContentSubmitted: boolean;
	isStoreFlow: boolean;
	pages: Array< ServerPageData >;
	siteLogoUrl: string;
	genericFeedback: string;
	searchTerms: string;
};
