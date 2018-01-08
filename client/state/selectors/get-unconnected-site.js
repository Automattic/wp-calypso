/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getUnconnectedSite( state, siteId ) {
	return get( state.jetpackOnboarding.credentials, siteId, null );
}
