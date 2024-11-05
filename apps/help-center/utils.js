import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

/**
 * Get unlock API from Gutenberg.
 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
 */
export const getUnlock = () => {
	/**
	 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
	 */
	let unlock;
	try {
		unlock = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
			'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
			'@wordpress/edit-site'
		).unlock;
		return unlock;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: Unable to get the unlock api. Reason: %s', error );
		return undefined;
	}
};
