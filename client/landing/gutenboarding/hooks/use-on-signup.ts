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

/**
 * After signup a site is automatically created using the username and bearerToken
 **/

export default function useOnSignup() {
	const locale = useLocale();
	const { createSite } = useDispatch( ONBOARD_STORE );

	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const visibility = useNewSiteVisibility();

	const handleCreateSite = React.useCallback(
		( username: string, isPublicSite: number, bearerToken?: string ) => {
			createSite( {
				username,
				languageSlug: locale,
				bearerToken,
				visibility: isPublicSite,
			} );
		},
		[ createSite, locale ]
	);

	React.useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username && ! newSite ) {
			handleCreateSite( newUser.username, visibility, newUser.bearerToken );
		}
	}, [ newSite, newUser, locale, handleCreateSite, visibility ] );
}
