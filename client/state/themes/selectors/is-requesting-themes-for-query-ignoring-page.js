/**
 * External dependencies
 */
import { isEqual, omit, some } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import {
	getDeserializedThemesQueryDetails,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
} from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns true if currently requesting themes for the themes query, regardless
 * of page, or false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {boolean}        Whether themes are being requested
 */
export const isRequestingThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedThemesQuery( query ), 'page' );
		return some( state.themes.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedThemesQueryDetails( serializedQuery );
			if ( queryDetails.siteId !== siteId ) {
				return false;
			}

			return isEqual( normalizedQueryWithoutPage, omit( queryDetails.query, 'page' ) );
		} );
	},
	( state ) => state.themes.queryRequests,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);
