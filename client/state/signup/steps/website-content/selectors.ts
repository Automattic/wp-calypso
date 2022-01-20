import 'calypso/state/signup/init';
import { initialState, WebsiteContentCollection } from './schema';

interface StateModel {
	signup: {
		steps: {
			websiteContentCollection: WebsiteContentCollection;
		};
	};
}

export function getWebsiteContent( state: StateModel ) {
	return (
		state.signup?.steps?.websiteContentCollection?.websiteContent || initialState.websiteContent
	);
}
export function getWebsiteContentDataCollectionIndex( state: StateModel ) {
	return state.signup?.steps?.websiteContentCollection?.currentIndex || initialState.currentIndex;
}
