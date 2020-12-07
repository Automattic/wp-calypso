/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { SITE_STORE } from '../stores/site';
import { useNewSiteVisibility } from './use-selected-plan';
import { useNewQueryParam, useIsAnchorFm } from '../path';

/**
 * After signup a site is automatically created using the username and bearerToken
 **/

export default function useOnLogin(): void {
	const locale = useLocale();
	const { createSite } = useDispatch( ONBOARD_STORE );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );

	const shouldTriggerCreate = useNewQueryParam();
	const visibility = useNewSiteVisibility();
	const isAnchorFmSignup = useIsAnchorFm();

	React.useEffect( () => {
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
