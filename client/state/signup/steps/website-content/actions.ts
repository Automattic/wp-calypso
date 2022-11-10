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
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
} from 'calypso/state/action-types';
import { ImageData } from './schema';
import 'calypso/state/signup/init';
import type { SiteId } from 'calypso/types';

export function imageUploaded( data: { pageId: string; mediaIndex: number; image: ImageData } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_COMPLETED,
		payload: data,
	};
}

export function imageRemoved( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_REMOVED,
		payload: data,
	};
}

export function imageUploadInitiated( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_STARTED,
		payload: data,
	};
}

export function imageUploadFailed( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_FAILED,
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

function getImagePlaceholders( pageId: PageId ) {
	switch ( pageId ) {
		case PORTFOLIO_PAGE:
		case PHOTO_GALLERY_PAGE:
			return Array( 8 ).fill( { caption: '', url: '' } );
		case HOME_PAGE:
		case BLOG_PAGE:
		case CONTACT_PAGE:
		case ABOUT_PAGE:
		case VIDEO_GALLERY_PAGE:
		case FAQ_PAGE:
		case SERVICES_PAGE:
		case TESTIMONIALS_PAGE:
		case PRICING_PAGE:
		case TEAM_PAGE:
		default:
			return Array( 4 ).fill( { caption: '', url: '' } );
	}
}

export function initializePages(
	pageNames: Array< { id: PageId; name: TranslateResult } >,
	siteId: SiteId
) {
	const generatedPages = pageNames.map( ( { id, name } ) => ( {
		id,
		title: name,
		content: '',
		images: getImagePlaceholders( id ),
	} ) );

	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
		payload: {
			pages: generatedPages,
			siteId,
		},
	};
}
