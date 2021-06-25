/**
 * External dependencies
 */
import validUrl from 'valid-url';

/**
 * Internal dependencies
 */

// Only override the back button from an external URL source on the below step(s) which is typically where we'd send them to as the 'entry'.
// We don't want to send them "back" to the source URL if they click back on "domains-launch/mapping" for example. Just send them back to the previous step.
export const backUrlExternalSourceStepsOverrides = [ 'use-your-domain' ];

// Override Back link if source parameter is found below
export const backUrlSourceOverrides = {
	'business-name-generator': '/business-name-generator',
	domains: '/domains',
};

export function getExternalBackUrl( source, sectionName = null ) {
	if ( ! source ) {
		return false;
	}

	if ( backUrlSourceOverrides[ source ] ) {
		return backUrlSourceOverrides[ source ];
	}

	if (
		backUrlExternalSourceStepsOverrides.includes( sectionName ) &&
		validUrl.isWebUri( source )
	) {
		return source;
	}

	return false;
}
