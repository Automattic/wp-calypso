/**
 * External dependencies
 */
import { get, keys, difference } from 'lodash';

/**
 * Internal dependencies
 */
import steps from 'calypso/signup/config/steps-pure';

export function assertValidDependencies( stepName, providedDependencies ) {
	const providesDependencies = get( steps, [ stepName, 'providesDependencies' ], [] );
	const extraDependencies = difference( keys( providedDependencies ), providesDependencies );

	if ( extraDependencies.length > 0 ) {
		throw new Error(
			'This step (' +
				stepName +
				') provides an unspecified dependency [' +
				extraDependencies.join( ', ' ) +
				'].' +
				' Make sure to specify it in /signup/config/steps-pure.js, using the providesDependencies property.'
		);
	}
}
