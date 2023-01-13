import { TranslateResult } from 'i18n-calypso';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SERVICES_PAGE,
	TESTIMONIALS_PAGE,
	PRICING_PAGE,
	TEAM_PAGE,
	PageId,
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
} from 'calypso/state/action-types';
import { Media, MediaUploadType, WebsiteContentServerState } from './types';
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

export function websiteContentFieldChanged( payload: {
	pageId: string;
	fieldName: string;
	fieldValue: string;
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
		case VIDEO_GALLERY_PAGE:
			return Array( 4 ).fill( getSingleMediaPlaceholder( 'VIDEO' ) );
		case PORTFOLIO_PAGE:
		case PHOTO_GALLERY_PAGE:
			return Array( 8 ).fill( getSingleMediaPlaceholder( 'IMAGE' ) );
		case HOME_PAGE:
		case BLOG_PAGE:
		case CONTACT_PAGE:
		case ABOUT_PAGE:
		case FAQ_PAGE:
		case SERVICES_PAGE:
		case TESTIMONIALS_PAGE:
		case PRICING_PAGE:
		case TEAM_PAGE:
		default:
			return Array( 4 ).fill( getSingleMediaPlaceholder( 'IMAGE' ) );
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
 * This action essentially maps server state to local state.
 * Page titles are currently picked from client app translations, but
 * they will be a part of local & server state in the future.
 */
export function initializeWebsiteContentForm(
	websiteContentServerState: WebsiteContentServerState,
	translatedPageTitles: Record< PageId, TranslateResult >
) {
	const { selectedPageTitles, pages, siteLogoUrl, genericFeedback } = websiteContentServerState;

	const generatedPages = selectedPageTitles.map( ( pageId ) => {
		const savedContent = pages.find( ( page ) => page.id === pageId );

		return {
			id: pageId,
			title: translatedPageTitles[ pageId ],
			content: savedContent?.content ?? '',
			media: getInitialMediaState( pageId, savedContent?.media ),
		};
	} );

	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
		payload: {
			pages: generatedPages,
			siteLogoSection: { siteLogoUrl },
			feedbackSection: { genericFeedback },
		},
	};
}
