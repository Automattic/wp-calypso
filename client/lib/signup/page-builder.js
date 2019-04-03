/**
 * Internal dependencies
 */
import { abtest, getABTestVariation } from 'lib/abtest';
import { getLocaleSlug } from 'lib/i18n-utils';
import { getSectionGroup } from 'state/ui/selectors';

export function isInPageBuilderTest() {
	return 'test' === getABTestVariation( 'pageBuilderMVP' );
}

export function shouldEnterPageBuilder() {
	return 'test' === abtest( 'pageBuilderMVP' );
}

export function getEditHomeUrl( siteSlug ) {
	// @todo we will need to retrieve the home page ID from site options
	return `/block-editor/page/${ siteSlug }/2`;
}

export function isEligibleForPageBuilder( segment, flowName ) {
	return 'en' === getLocaleSlug() && 1 === segment && 'onboarding-for-business' === flowName;
}

export function isBlockEditorSectionInTest( state ) {
	return 'gutenberg' === getSectionGroup( state ) && isInPageBuilderTest();
}
