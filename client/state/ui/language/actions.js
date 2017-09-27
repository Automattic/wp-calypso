/**
 * External dependencies
 */
import switchLocale from 'lib/i18n-utils/switch-locale';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	LOCALE_SET,
} from 'state/action-types';

/**
 * Set the ui locale
 *
 * @param   {Object} localeSlug the locale slug to change the locale to
 * @returns {Function} Action thunk
 */
export const setLocale = localeSlug => dispatch => (
	switchLocale( localeSlug ).then( () => {
		dispatch( {
			type: LOCALE_SET,
			localeSlug,
		} );
	} )
);

/**
 * Set the ui locale using a raw (jed) translation object
 *
 * @param   {Object} localeData the locale data to be set
 * @returns {Object} Action
 */
export const setLocaleRawData = localeData => {
	i18n.setLocale( localeData );
	return {
		type: LOCALE_SET,
		localeSlug: localeData[ '' ].localeSlug,
	};
};
