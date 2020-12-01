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
import { useIsAnchorFm } from '../path';

/**
 * After signup a site is automatically created using the username and bearerToken
 **/

export default function useOnSignup() {
	const locale = useLocale();
	const { createSite } = useDispatch( ONBOARD_STORE );

	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const visibility = useNewSiteVisibility();
	const isAnchorFmSignup = useIsAnchorFm();

	const handleCreateSite = React.useCallback(
		( username: string, bearerToken?: string, isPublicSite?: number ) => {
			createSite( username, locale, bearerToken, isPublicSite );
		},
		[ createSite, locale ]
	);

	React.useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username && ! newSite && ! isAnchorFmSignup ) {
			handleCreateSite( newUser.username, newUser.bearerToken, visibility );
		}
	}, [ newSite, newUser, locale, handleCreateSite, visibility, isAnchorFmSignup ] );
}
