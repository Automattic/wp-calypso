/** @format */

/**
 * External dependencies
 */
import { get, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { createEndpoints } from './endpoints';
import { createSelectors } from './selectors';

export default function createSiteData( wcApiSite, wcApiState ) {
	if ( ! isNumber( wcApiSite ) ) {
		return null;
	}

	const endpointData = get( wcApiState, [ wcApiSite, 'endpoints' ], {} );
	const endpoints = createEndpoints( endpointData );
	const selectors = createSelectors( endpoints );

	return { ...selectors };
}
