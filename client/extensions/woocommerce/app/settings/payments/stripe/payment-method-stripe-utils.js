/**
 * External dependencies
 */
import { get } from 'lodash';
import url from 'url';

/**
 * Internal dependencies
 */

export function hasStripeKeyPairForMode( method ) {
	const { settings } = method;
	const isLiveMode = method.settings.testmode.value !== 'yes';
	if ( isLiveMode ) {
		return settings.secret_key.value.trim() && settings.publishable_key.value.trim();
	}
	return settings.test_secret_key.value.trim() && settings.test_publishable_key.value.trim();
}

export function getStripeSampleStatementDescriptor( domain ) {
	return domain.substr( 0, 22 ).trim().toUpperCase();
}

export function hasOAuthParamsInLocation() {
	const oauthParams = getOAuthParamsFromLocation();
	return oauthParams.state.length && oauthParams.code.length;
}

export function hasOAuthCompleteInLocation() {
	try {
		const parsedURL = url.parse( window.location.href, true, true );
		return get( parsedURL, [ 'query', 'oauth_complete' ], false );
	} catch ( e ) {
		return false;
	}
}

export function getOAuthParamsFromLocation() {
	let state = '';
	let code = '';

	try {
		const parsedURL = url.parse( window.location.href, true, true );
		state = get( parsedURL, [ 'query', 'wcs_stripe_state' ], false );
		code = get( parsedURL, [ 'query', 'wcs_stripe_code' ], false );
	} catch ( e ) {}

	return {
		state,
		code,
	};
}
