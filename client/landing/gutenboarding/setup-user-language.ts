/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { USER_STORE } from './stores/user';

/**
 * Calypso dependencies ⚠️
 */
import switchLocale from '../../lib/i18n-utils/switch-locale';

// Look for user bootstrapping
declare const window:
	| undefined
	| { currentUser?: import('@automattic/data-stores').User.CurrentUser };

const SetupUserLanguage: FunctionComponent = () => {
	const userLang = useSelect( select => select( USER_STORE ).getCurrentUser()?.language );
	useEffect( () => {
		if ( userLang ) {
			switchLocale( userLang );
		}
	}, [ userLang ] );
	return null;
};

export default SetupUserLanguage;
