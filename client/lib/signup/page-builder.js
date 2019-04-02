/**
 * Internal dependencies
 */
import { abtest, getABTestVariation } from 'lib/abtest';
import { getLocaleSlug } from 'lib/i18n-utils';

export function isInPageBuilderTest() {
	return 'test' === getABTestVariation( 'pageBuilderMVP' );
}

export function shouldEnterPageBuilder() {
	return 'test' === abtest( 'pageBuilderMVP' );
}

export function isEligibleForPageBuilder( segment, flowName ) {
	return 'en' === getLocaleSlug() && 1 === segment && 'onboarding-for-business' === flowName;
}
