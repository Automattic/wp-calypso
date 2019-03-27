/**
 * Internal dependencies
 */
import config from 'config';
import { getLocaleSlug } from 'lib/i18n-utils';

// temp
let inTest = false;

export function isInPageBuilderTest() {
	// This will check an already-set abtest value with
	// `getABTestVariation` when ready to launch
	return inTest;
}

export function shouldEnterPageBuilder() {
	// This will become an abtest when we are ready to launch
	inTest = config.isEnabled( 'signup/page-builder' );
	// using `inTest` this way ensures that `isInPageBuilderTest` will only
	// return true after this, like assigning the test and later checking `getABTestVariation`
	return inTest;
}

export function isElibigleForPageBuilder( segment, flowName ) {
	return 'en' === getLocaleSlug() && 1 === segment && 'onboarding-for-business' === flowName;
}
