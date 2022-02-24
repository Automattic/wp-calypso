import 'calypso/state/signup/init';
import { IMAGE_UPLOAD_STATES } from './reducer';
import { initialState, WebsiteContentCollection } from './schema';

export interface WebsiteContentStateModel {
	signup: {
		steps: {
			websiteContentCollection: WebsiteContentCollection;
		};
	};
}

export function getWebsiteContent( state: WebsiteContentStateModel ) {
	return (
		state.signup?.steps?.websiteContentCollection?.websiteContent || initialState.websiteContent
	);
}
export function getWebsiteContentDataCollectionIndex( state: WebsiteContentStateModel ) {
	return state.signup?.steps?.websiteContentCollection?.currentIndex || initialState.currentIndex;
}

export function getImageUploadStates( state: WebsiteContentStateModel ) {
	return (
		state.signup?.steps?.websiteContentCollection?.imageUploadStates ||
		initialState.imageUploadStates
	);
}

export function isImageUploadInProgress( state: WebsiteContentStateModel ) {
	const imageUploadStates = getImageUploadStates( state );
	const allStates = Object.values( imageUploadStates ).flatMap( ( pageImages ) =>
		Object.values( pageImages )
	);
	return allStates.some( ( s ) => IMAGE_UPLOAD_STATES.UPLOAD_STARTED === s );
}
