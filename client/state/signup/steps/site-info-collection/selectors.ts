import 'calypso/state/signup/init';
import { initialState, SiteInfoCollectionData } from './schema';

interface StateModel {
	signup: { steps: { siteInformationCollection: SiteInfoCollectionData } };
}

export function getSiteInfoCollectionData( state: StateModel ) {
	const { siteInfo } = state.signup?.steps?.siteInformationCollection || initialState;
	return siteInfo;
}

export function getSiteInfoCollectionTouchedStates( state: StateModel ) {
	const { sectionsTouched } = state.signup?.steps?.siteInformationCollection || initialState;
	return sectionsTouched;
}

export function getSiteInfoCollectionOpenedSection( state: StateModel ) {
	return state.signup?.steps?.siteInformationCollection?.initialOpenSectionId || '';
}

export function getSiteInfoCollectionTouchedSection( state: StateModel ) {
	return (
		state.signup?.steps?.siteInformationCollection?.sectionsTouched || initialState.sectionsTouched
	);
}

export function getSiteInfoCollectionSiteTitle( state: StateModel ) {
	const siteInformationCollection = state.signup?.steps?.siteInformationCollection;
	return siteInformationCollection?.siteInfo?.siteTitle || '';
}
