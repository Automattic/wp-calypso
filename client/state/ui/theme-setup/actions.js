/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_SETUP_CLOSE_DIALOG,
	THEME_SETUP_OPEN_DIALOG,
	THEME_SETUP_REQUEST,
	THEME_SETUP_RESULT,
} from 'state/action-types';

export function openDialog() {
	return {
		type: THEME_SETUP_OPEN_DIALOG,
	};
}

export function closeDialog() {
	return {
		type: THEME_SETUP_CLOSE_DIALOG,
	};
}

export function runThemeSetup( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_SETUP_REQUEST,
		} );

		return wpcom.undocumented().site( siteId ).runThemeSetup()
			.then( response => {
				dispatch( {
					type: THEME_SETUP_RESULT,
					data: response,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_SETUP_RESULT,
					data: error,
				} );
			} );
	};
}
