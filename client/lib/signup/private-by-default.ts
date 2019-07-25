/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

const debug = debugFactory( 'calypso:signup:private-by-default' );

/**
 * Should the site be private by default
 *
 * @param dependenciesAndStepData a combination of the `dependencies` & `stepData` objects passed to the `apiRequestFunction` step action function call
 * @returns `true` for private by default & `false` for not
 */
export function shouldBePrivateByDefault( dependenciesAndStepData: object ): boolean {
	debug( { dependenciesAndStepData } );

	// Put any circumstances which should NOT be private by default here

	return abtest( 'privateByDefault' ) === 'selected';
}

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 *
 * @param dependenciesAndStepData a combination of the `dependencies` & `stepData` objects passed to the `apiRequestFunction` step action function call
 * @returns `1` for private by default & `1` for public
 */
export function getNewSitePublicSetting( dependenciesAndStepData: object ): number {
	return shouldBePrivateByDefault( dependenciesAndStepData ) ? -1 : 1;
}
