import { useLocale } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useNewQueryParam, useIsAnchorFm } from '../path';
import { ONBOARD_STORE } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import { USER_STORE } from '../stores/user';
import { useNewSiteVisibility } from './use-selected-plan';
import type { SiteSelect, UserSelect } from '@automattic/data-stores';

/**
 * After signup a site is automatically created using the username and bearerToken
 */

export default function useOnLogin(): void {
	const locale = useLocale();
	const { createSite } = useDispatch( ONBOARD_STORE );
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const isCreatingSite = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).isFetchingSite(),
		[]
	);
	const newSite = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getNewSite(),
		[]
	);

	const shouldTriggerCreate = useNewQueryParam();
	const visibility = useNewSiteVisibility();
	const isAnchorFmSignup = useIsAnchorFm();

	useEffect( () => {
		if (
			! isCreatingSite &&
			! newSite &&
			currentUser &&
			shouldTriggerCreate &&
			! isAnchorFmSignup
		) {
			createSite( {
				username: currentUser.username,
				languageSlug: locale,
				bearerToken: undefined,
				visibility,
				anchorFmPodcastId: null,
				anchorFmEpisodeId: null,
				anchorFmSpotifyUrl: null,
			} );
		}
	}, [
		createSite,
		currentUser,
		isCreatingSite,
		newSite,
		locale,
		shouldTriggerCreate,
		visibility,
		isAnchorFmSignup,
	] );
}
