import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

// WordPress has changed this wording; older versions expect the second.
const CONSENT_STRINGS = [
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
];

type Unlock = < T = Record< string, unknown > >( apis: unknown ) => T;

function optIn(): Unlock | undefined {
	for ( const consent of CONSENT_STRINGS ) {
		try {
			return (
				__dangerousOptInToUnstableAPIsOnlyForCoreModules( consent, '@wordpress/edit-site' ) as {
					unlock: Unlock;
				}
			 ).unlock;
		} catch {
			// Wrong wording for this WordPress; try the next.
		}
	}

	return undefined;
}

/**
 * Opens WordPress private APIs, or `undefined` where this WordPress accepts
 * neither consent wording. Callers treat that as the feature being absent.
 */
export const unlock = optIn();
