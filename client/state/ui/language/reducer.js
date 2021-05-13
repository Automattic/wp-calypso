/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { LOCALE_SET } from 'calypso/state/action-types';

const initialState = {
	localeSlug: config( 'i18n_default_locale_slug' ),
	localeVariant: null,
};

/**
 * Tracks the state of the ui locale
 *
 * @param {object} state  Current state
 * @param {object} action Action payload
 * @returns {object} Updated state
 *
 */
export default function language( state = initialState, action ) {
	switch ( action.type ) {
		case LOCALE_SET:
			return {
				localeSlug: action.localeSlug,
				localeVariant: action.localeVariant,
			};

		default:
			return state;
	}
}
