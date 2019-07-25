/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

const debug = debugFactory( 'calypso:signup:private-by-default' );

interface PrivateByDefaultSiteSettings {
	flowName?: string;
}

/**
 * Should the site be private by default
 * @param siteSettings PrivateByDefaultSiteSettings
 * @returns `true` for private by default & `false` for not
 */
export function shouldBePrivateByDefault( {
	flowName = '',
}: PrivateByDefaultSiteSettings ): boolean {
	if ( flowName.match( /^ecommerce/ ) ) {
		// ecommerce plans go atomic after checkout. These sites should default to public for now.
		return false;
	}

	return abtest( 'privateByDefault' ) === 'selected';
}

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 *
 * @param dependencies The `dependencies` passed to the `apiRequestFunction` step action function call
 * @param stepData The `stepData` passed to the `apiRequestFunction` step action function call
 * @returns `1` for private by default & `1` for public
 */
export function getNewSitePublicSetting( dependencies: object, stepData: object ): number {
	debug( 'getNewSitePublicSetting input', { dependencies, stepData } );

	return shouldBePrivateByDefault( { ...stepData } ) ? -1 : 1;
}
