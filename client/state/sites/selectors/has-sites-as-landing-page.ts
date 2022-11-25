import { createSelector } from '@automattic/state-utils';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';

export const hasSitesAsLandingPage = createSelector( ( state: AppState ): boolean => {
	const { useSitesAsLandingPage = false } = getPreference( state, 'sites-landing-page' ) ?? {};

	return useSitesAsLandingPage;
} );
