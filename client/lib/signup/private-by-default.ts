/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getSiteTypePropertyValue } from './site-type';
import { getCurrentFlowName } from 'state/signup/flow/selectors';

const debug = debugFactory( 'calypso:signup:private-by-default' );

/**
 * Should the site be private by default
 * @param siteType The selected site type / segment. Corresponds with the `slug` in ./site-type.js
 * @param state The current client state
 * @returns `true` for private by default & `false` for not
 */
export function shouldBePrivateByDefault( siteType: string = '', state ): boolean {
	if ( getCurrentFlowName( state ) === 'test-fse' ) {
		return true;
	}

	if ( getSiteTypePropertyValue( 'slug', siteType, 'forcePublicSite' ) ) {
		return false;
	}

	return abtest( 'privateByDefault' ) === 'selected';
}

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 * @param siteType The selected site type / segment. Corresponds with the `slug` in ./site-type.js
 * @param state The current client state
 * @returns `-1` for private by default & `1` for public
 */
export function getNewSitePublicSetting( siteType: string = '', state ): number {
	debug( 'getNewSitePublicSetting input', { siteType } );

	return shouldBePrivateByDefault( siteType, state ) ? -1 : 1;
}
