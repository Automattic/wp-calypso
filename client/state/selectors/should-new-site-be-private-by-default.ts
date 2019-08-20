/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { getCurrentFlowName } from 'state/signup/flow/selectors';

/**
 * Should the site be private by default
 * @param state The current client state
 * @param siteType The selected site type / segment. Corresponds with the `slug` in ./site-type.js
 * @returns `true` for private by default & `false` for not
 */
export function shouldNewSiteBePrivateByDefault( state, siteType: string = '' ): boolean {
	if ( getCurrentFlowName( state ) === 'test-fse' ) {
		return true;
	}

	if ( getSiteTypePropertyValue( 'slug', siteType, 'forcePublicSite' ) ) {
		return false;
	}

	return abtest( 'privateByDefault' ) === 'selected';
}
