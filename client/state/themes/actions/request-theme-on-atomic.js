import { map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { THEME_REQUEST, THEME_REQUEST_SUCCESS } from 'calypso/state/themes/action-types';
import { receiveThemes } from 'calypso/state/themes/actions/receive-themes';
import { themeRequestFailure } from 'calypso/state/themes/actions/theme-request-failure';
import { normalizeJetpackTheme } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to fetch a specific theme on an atomic site.
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID
 * @returns {Function}         Action thunk
 */
export function requestThemeOnAtomic( themeId, siteId ) {
	return async ( dispatch ) => {
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId,
		} );

		try {
			const { themes } = await wpcom.req.get( {
				path: `/sites/${ siteId }/themes/${ themeId }`,
				apiNamespace: 'wp/v2',
			} );
			dispatch( receiveThemes( map( themes, normalizeJetpackTheme ), siteId ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId,
			} );
		} catch ( error ) {
			dispatch( themeRequestFailure( siteId, themeId, error ) );
		}
	};
}
