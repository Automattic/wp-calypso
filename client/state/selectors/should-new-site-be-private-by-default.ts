/**
 * Internal dependencies
 */
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getCurrentFlowName } from 'state/signup/flow/selectors';

/**
 * Should the site be private by default
 * @param state The current client state
 * @returns `true` for private by default & `false` for not
 */
export default function shouldNewSiteBePrivateByDefault( state: object ): boolean {
	if ( getCurrentFlowName( state ) === 'test-fse' ) {
		return true;
	}
	if ( getSiteTypePropertyValue( 'slug', getSiteType( state ).trim(), 'forcePublicSite' ) ) {
		return false;
	}

	return true;
}
