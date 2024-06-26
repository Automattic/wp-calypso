import {
	PHOTO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	PageId,
	CUSTOM_PAGE,
} from 'calypso/signup/difm/constants';
import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
	SIGNUP_STEPS_WEBSITE_CONTENT_CHANGES_SAVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_SEARCH_TERMS_CHANGED,
} from 'calypso/state/action-types';
import type { Media, MediaUploadType, WebsiteContentServerState } from './types';
import type { TranslateResult } from 'i18n-calypso';
import 'calypso/state/signup/init';

export type MediaUploadedData = {
	pageId: PageId;
	mediaIndex: number;
	media: Partial< Media >;
};
export function mediaUploaded( data: MediaUploadedData ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED,
		payload: data,
	};
}

export function mediaRemoved( data: { pageId: PageId; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED,
		payload: data,
	};
}

export function mediaUploadInitiated( data: { pageId: PageId; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED,
		payload: data,
	};
}

export function mediaUploadFailed( data: { pageId: PageId; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED,
		payload: data,
	};
}

export function logoUploadStarted() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	};
}

export function logoUploadCompleted( url: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
		payload: { url },
	};
}

export function logoUploadFailed() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	};
}

export function logoRemoved() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	};
}

export function updateFeedback( feedback: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
		payload: { feedback },
	};
}

export function updateSearchTerms( searchTerms: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_SEARCH_TERMS_CHANGED,
		payload: { searchTerms },
	};
}

export function websiteContentFieldChanged( payload: {
	pageId: string;
	fieldName: string;
	fieldValue: string | boolean;
} ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
		payload,
	};
}

export function updateWebsiteContentCurrentIndex( currentIndex: number ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
		payload: currentIndex,
	};
}

export function getSingleMediaPlaceholder( mediaType: MediaUploadType ) {
	return { caption: '', url: '', mediaType: mediaType, thumbnailUrl: '' };
}

function getMediaPlaceholders( pageId: PageId ): Array< Media > {
	switch ( pageId ) {
		case PORTFOLIO_PAGE:
		case PHOTO_GALLERY_PAGE:
		case CUSTOM_PAGE:
			return Array( 8 ).fill( getSingleMediaPlaceholder( 'IMAGE-AND-VIDEO' ) );
		default:
			return Array( 4 ).fill( getSingleMediaPlaceholder( 'IMAGE-AND-VIDEO' ) );
	}
}

/**
 * Return the initial state for the page-wise media state.
 * Each page type supports a different number of media uploads (@see getMediaPlaceholders).
 */
function getInitialMediaState( pageId: PageId, savedMedia: Media[] | null | undefined ): Media[] {
	const mediaPlaceholders = getMediaPlaceholders( pageId );

	// Return placeholders if server state does not contain any media
	if ( ! savedMedia?.length ) {
		return mediaPlaceholders;
	}

	// Return server state if the number of items matches or exceeds the number of placeholders
	if ( savedMedia.length >= mediaPlaceholders.length ) {
		return savedMedia;
	}

	// If the number of items does not match the number of placeholders,
	// use server state and placeholders to return the correct number of items.
	return [
		...savedMedia,
		...mediaPlaceholders.slice( 0, mediaPlaceholders.length - savedMedia.length ),
	];
}

/**
 * Return the page title to be shown on the website content form.
 * Return the title of the saved page if it exists.
 * If the page is not a custom page, return the translated page title.
 * Else, return an empty string.
 */
function getInitialTitle( {
	pageId,
	savedTitle,
	translatedPageTitle,
}: {
	pageId: PageId;
	savedTitle?: string;
	translatedPageTitle: TranslateResult;
} ) {
	if ( savedTitle ) {
		return savedTitle;
	}
	if ( pageId !== CUSTOM_PAGE ) {
		return translatedPageTitle;
	}
	return '';
}

/**
 * This action essentially maps server state to local state.
 * Page titles are currently picked from client app translations, but
 * they will be a part of local & server state in the future.
 */
export function initializeWebsiteContentForm(
	websiteContentServerState: WebsiteContentServerState,
	translatedPageTitles: Record< PageId, TranslateResult >
) {
	const { selectedPageTitles, pages, siteLogoUrl, searchTerms, genericFeedback } =
		websiteContentServerState;

	const generatedPages = selectedPageTitles.map( ( pageId ) => {
		const savedContent = pages.find( ( page ) => page.id === pageId );

		return {
			id: pageId,
			title: getInitialTitle( {
				pageId,
				savedTitle: savedContent?.title,
				translatedPageTitle: translatedPageTitles[ pageId ],
			} ),
			content: savedContent?.content ?? '',
			displayEmail: savedContent?.displayEmail || undefined,
			displayPhone: savedContent?.displayPhone || undefined,
			displayAddress: savedContent?.displayAddress || undefined,
			useFillerContent: savedContent?.useFillerContent || false,
			media: getInitialMediaState( pageId, savedContent?.media ),
		};
	} );

	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
		payload: {
			pages: generatedPages,
			siteInformationSection: { siteLogoUrl, searchTerms },
			feedbackSection: { genericFeedback },
		},
	};
}

export function changesSaved() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_CHANGES_SAVED,
	};
}
