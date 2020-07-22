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
import { useShouldSiteBePublic } from './use-selected-plan';
import { useNewQueryParam } from '../path';

/**
 * After signup a site is automatically created using the username and bearerToken
 **/

export default function useOnSignup() {
	const { i18nLocale } = useI18n();
	const { createSite } = useDispatch( ONBOARD_STORE );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );

	const shouldTriggerCreate = useNewQueryParam();
	const shouldSiteBePublic = useShouldSiteBePublic();

	React.useEffect( () => {
		if ( ! isCreatingSite && ! newSite && currentUser && shouldTriggerCreate ) {
			createSite( currentUser.username, i18nLocale, undefined, shouldSiteBePublic );
		}
	}, [
		createSite,
		currentUser,
		isCreatingSite,
		newSite,
		i18nLocale,
		shouldTriggerCreate,
		shouldSiteBePublic,
	] );
}
