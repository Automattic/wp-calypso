import 'calypso/state/signup/init';
import { initialState } from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteInfoCollectionData( state: any ) {
	return state.signup?.steps?.siteInformationCollection || initialState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteInfoCollectionCurrentIndex( state: any ) {
	return state.signup?.steps?.siteInformationCollection?.currentIndex || 0;
}
