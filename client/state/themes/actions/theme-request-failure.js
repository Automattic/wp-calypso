/**
 * Internal dependencies
 */
import { THEME_REQUEST_FAILURE } from 'state/action-types';

import 'state/themes/init';

export function themeRequestFailure( siteId, themeId, error ) {
	return {
		type: THEME_REQUEST_FAILURE,
		siteId,
		themeId,
		error,
	};
}
