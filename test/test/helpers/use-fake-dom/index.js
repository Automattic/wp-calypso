/**
 * External dependencies
 */
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import reactTestEnvSetup from 'react-test-env';

const useFakeDom = flow( [ reactTestEnvSetup.useFakeDom, () => {
	// While it may not be the case that `page` is loaded in the context of
	// a DOM-dependent test, if it is, we must ensure that it's uncached
	// after the test finishes, since it stores a reference to the document
	// at the time of module load which will no longer exist after the
	// document is destroyed.
	after( () => delete require.cache[ require.resolve( 'page' ) ] );
} ] );

useFakeDom.withContainer = reactTestEnvSetup.useFakeDom.withContainer;
useFakeDom.getContainer = reactTestEnvSetup.useFakeDom.getContainer;

export default useFakeDom;
