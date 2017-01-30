/**
 * Internal dependencies
 */
import {
	NAVIGATE_TO_ROUTE,
} from 'state/action-types';

export const navigateToRoute = ( route ) => ( {
	type: NAVIGATE_TO_ROUTE,
	route,
} );
