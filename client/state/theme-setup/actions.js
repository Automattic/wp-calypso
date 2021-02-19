/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	THEME_SETUP_TOGGLE_DIALOG,
	THEME_SETUP_REQUEST,
	THEME_SETUP_RESULT,
} from 'calypso/state/themes/action-types';

import 'calypso/state/theme-setup/init';

export function toggleDialog() {
	return {
		type: THEME_SETUP_TOGGLE_DIALOG,
	};
}

export function runThemeSetup( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_SETUP_REQUEST,
		} );

		return wpcom
			.undocumented()
			.site( siteId )
			.runThemeSetup()
			.then( ( response ) => {
				dispatch( {
					type: THEME_SETUP_RESULT,
					data: response,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_SETUP_RESULT,
					data: error,
				} );
			} );
	};
}
