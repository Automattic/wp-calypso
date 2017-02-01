/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_SETUP_CLOSE_DIALOG,
	THEME_SETUP_FAILURE,
	THEME_SETUP_OPEN_DIALOG,
	THEME_SETUP_REQUEST,
	THEME_SETUP_SUCCESS,
} from 'state/action-types';

export function openDialog( saveExisting = true ) {
	return {
		type: THEME_SETUP_OPEN_DIALOG,
		saveExisting,
	};
}

export function closeDialog() {
	return {
		type: THEME_SETUP_CLOSE_DIALOG,
	};
}

export function runThemeSetup( saveExisting, siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_SETUP_REQUEST,
		} );

		return wpcom.undocumented().site( siteId ).runThemeSetup( saveExisting )
			.then( response => {
				dispatch( {
					type: THEME_SETUP_SUCCESS,
					data: response,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_SETUP_FAILURE,
					data: error,
				} );
			} );
	};
}
