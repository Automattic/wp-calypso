/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { SITE_STORE } from '../stores/site';
import { getFreeDomainSuggestions } from '../utils/domain-suggestions';
import { useDomainSuggestions } from './use-domain-suggestions';
import { useShouldSiteBePublicOnSelectedPlan } from './use-selected-plan';

/**
 * After signup or login a site is automatically created using the username and bearerToken
 **/

export default function useSignup() {
	const { i18nLocale } = useI18n();

	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { createSite } = useDispatch( ONBOARD_STORE );

	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();

	const allSuggestions = useDomainSuggestions( { searchOverride: siteTitle, locale: i18nLocale } );
	const freeDomainSuggestion = getFreeDomainSuggestions( allSuggestions )?.[ 0 ];

	const handleCreateSite = React.useCallback(
		( username: string, bearerToken?: string, isPublicSite?: boolean ) => {
			createSite( username, freeDomainSuggestion, bearerToken, isPublicSite );
		},
		[ createSite, freeDomainSuggestion ]
	);

	React.useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username && ! newSite ) {
			handleCreateSite( newUser.username, newUser.bearerToken, shouldSiteBePublic );
		}
	}, [ newSite, newUser, handleCreateSite, shouldSiteBePublic ] );
}
