import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

/**
 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
 * FIXME: The new version allow it by default, but we might need to ensure that all the site has the new version.
 * @see https://github.com/Automattic/wp-calypso/pull/79663
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let unlockRouter;
try {
	unlockRouter = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
		'@wordpress/router'
	).unlock;
} catch ( error ) {
	// eslint-disable-next-line no-console
	console.error( 'Error: Unable to get the unlock api. Reason: %s', error );
}

export { unlockRouter };
