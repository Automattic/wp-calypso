import 'calypso/state/signup/init';
import { initialState, WebsiteContentCollection, MEDIA_UPLOAD_STATES } from './schema';

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

export function getMediaUploadStates( state: WebsiteContentStateModel ) {
	return (
		state.signup?.steps?.websiteContentCollection?.mediaUploadStates ||
		initialState.mediaUploadStates
	);
}

export function isMediaUploadInProgress( state: WebsiteContentStateModel ) {
	const mediaUploadStates = getMediaUploadStates( state );
	const allStates = Object.values( mediaUploadStates ).flatMap( ( pageImages ) =>
		Object.values( pageImages )
	);
	return allStates.some( ( s ) => MEDIA_UPLOAD_STATES.UPLOAD_STARTED === s );
}
