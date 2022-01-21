import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
} from 'calypso/state/action-types';
import { WebsiteContent } from './schema';
import 'calypso/state/signup/init';

export function updateWebsiteContent( data: WebsiteContent ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
		payload: data,
	};
}

export function updateWebsiteContentCurrentIndex( currentIndex: number ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
		payload: currentIndex,
	};
}
