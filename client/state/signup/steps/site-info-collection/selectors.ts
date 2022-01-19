import 'calypso/state/signup/init';
import { initialState } from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteInfoCollectionData( state: any ) {
	const { currentIndex, ...data } = state.signup?.steps?.siteInformationCollection || initialState;
	return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteInfoCollectionCurrentIndex( state: any ) {
	return state.signup?.steps?.siteInformationCollection?.currentIndex || 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteInfoCollectionSiteTitle( state: any ) {
	return state.signup?.steps?.siteInformationCollection?.siteTitle || '';
}
