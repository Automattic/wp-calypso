/**
 * External dependencies
 */
import { get } from 'lodash';

export function getJPOSiteTitle( state ) {
	console.log( 'selectors.js - getJPOSiteTitle()' );
	return get( state, 'signup.steps.jpoSiteTitle', '' );
}