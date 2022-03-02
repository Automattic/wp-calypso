import { TranslateResult } from 'i18n-calypso';
import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
} from 'calypso/state/action-types';
import { ImageData } from './schema';
import 'calypso/state/signup/init';

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

export function removeUploadedLogo() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	};
}

export function textChanged( data: { pageId: string; content: string } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED,
		payload: data,
	};
}

export function updateWebsiteContentCurrentIndex( currentIndex: number ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
		payload: currentIndex,
	};
}

export function initializePages( pageNames: Array< { id: string; name: TranslateResult } > ) {
	const generatedPages = pageNames.map( ( { id, name } ) => ( {
		id,
		title: name,
		content: '',
		images: [
			{ caption: '', url: '' },
			{ caption: '', url: '' },
			{ caption: '', url: '' },
		],
	} ) );
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
		payload: generatedPages,
	};
}
