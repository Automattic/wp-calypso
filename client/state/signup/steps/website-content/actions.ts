import { TranslateResult } from 'i18n-calypso';
import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOADED,
	SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
} from 'calypso/state/action-types';
import { WebsiteContent, ImageData } from './schema';
import 'calypso/state/signup/init';

export function updateWebsiteContent( data: WebsiteContent ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
		payload: data,
	};
}

export function imageUploaded( data: { id: string; mediaIndex: number; image: ImageData } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOADED,
		payload: data,
	};
}

export function textChanged( data: { id: string; content: string } ) {
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
