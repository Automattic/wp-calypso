/**
 * Internal dependencies
 */
import { withSchemaValidation } from 'state/utils';
import { LOCALE_SET } from 'state/action-types';
import { localeSchema } from './schema';

const initialState = {
	localeSlug: null,
	localeVariant: null,
};

/**
 * Tracks the state of the ui locale
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export default withSchemaValidation( localeSchema, ( state = initialState, action ) => {
	switch ( action.type ) {
		case LOCALE_SET:
			return {
				localeSlug: action.localeSlug,
				localeVariant: action.localeVariant,
			};

		default:
			return state;
	}
} );
