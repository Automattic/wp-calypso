import type { AppState } from 'calypso/types';

export default function isRequestingJetpackSitesFeatures( state: AppState ) {
	return state.sites.features.isRequestingJetpackSitesFeatures;
}
