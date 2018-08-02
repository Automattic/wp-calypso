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
		import( 'moment' ).then( moment => {
			import( /* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */
			`moment/locale/${ action.localeSlug }` ).then( () => {
				moment.locale( action.localeSlug );
			} );
		} );
	}
	return action;
}

export default () => next => action => next( updateMoment( action ) );
