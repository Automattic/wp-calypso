/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:selectors:private-by-default' );

/**
 * Should the site be private by default
 * @param state The current client state
 * @returns `true` for private by default & `false` for not
 */
export default function shouldNewSiteBePrivateByDefault( state: object ): boolean {
	debug( { state } );
	return true;
	/* TODO see what we need from here
	if ( getCurrentFlowName( state ) === 'test-fse' ) {
		return true;
	}

	if ( getSiteTypePropertyValue( 'slug', getSiteType( state ).trim(), 'forcePublicSite' ) ) {
		return false;
	}
*/
}
