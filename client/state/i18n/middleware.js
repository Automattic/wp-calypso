/**
 * @format
 */

/**
 * Internal dependencies
 */

import { LOCALE_SET } from 'state/action-types';

function updateMoment( action ) {
	if ( action && action.type === LOCALE_SET && action.localeSlug !== 'en' ) {
		// load moment and update the locale
		asyncRequire( 'moment', moment => {
			asyncRequire( 'moment/locale/' + action.localeSlug, () => {
				moment.locale( action.localeSlug );
			} );
		} );
	}
	return action;
}

export default () => next => action => next( updateMoment( action ) );
