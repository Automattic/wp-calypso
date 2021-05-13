/**
 * Internal dependencies
 */
import { abtest, getABTestVariation } from 'calypso/lib/abtest';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { getSectionGroup } from 'calypso/state/ui/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';

export function isInPageBuilderTest() {
	return 'test' === getABTestVariation( 'pageBuilderMVP' );
}

export function shouldEnterPageBuilder() {
	return 'test' === abtest( 'pageBuilderMVP' );
}

export function getEditHomeUrl( siteSlug ) {
	// @todo we will need to retrieve the home page ID from site options
	return `/page/${ siteSlug }/2`;
}

export function isEligibleForPageBuilder( segment, flowName ) {
	return 'en' === getLocaleSlug() && 1 === segment && 'onboarding' === flowName;
}

export function isBlockEditorSectionInTest( state ) {
	return 'gutenberg' === getSectionGroup( state ) && isInPageBuilderTest();
}

/**
 * This is only to be used once there is a `site` object post-signup
 *
 * @param {object} state  Redux state
 * @param {number} siteId Current site ID
 * @returns {boolean}        Is the site qualified?
 */
export function siteQualifiesForPageBuilder( state, siteId ) {
	const segment = getSiteOption( state, siteId, 'site_segment' );
	return isEligibleForPageBuilder( segment, 'onboarding' );
}
