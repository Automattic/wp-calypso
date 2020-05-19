/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { loadScript } from '@automattic/load-script';

const debug = debugFactory( 'calypso:analytics:recaptcha' );

const GOOGLE_RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js?render=explicit';

/**
 * Loads Google reCAPTCHA
 *
 * @returns {boolean} false if the script failed to load
 */
async function loadGoogleRecaptchaScript() {
	if ( window.grecaptcha ) {
		// reCAPTCHA already loaded
		return true;
	}

	try {
		const src = GOOGLE_RECAPTCHA_SCRIPT_URL;
		await loadScript( src );
		debug( 'loadGoogleRecaptchaScript: [Loaded]', src );
		return true;
	} catch ( error ) {
		debug( 'loadGoogleRecaptchaScript: [Load Error] the script failed to load: ', error );
		return false;
	}
}

/**
 * Renders reCAPTCHA badge to an explicit DOM id that should already be on the page
 *
 * @param {string} elementId - render client to this existing DOM node
 * @param {string} siteKey - reCAPTCHA site key
 * @returns {number} reCAPTCHA clientId
 */
async function renderRecaptchaClient( elementId, siteKey ) {
	try {
		const clientId = await window.grecaptcha.render( elementId, {
			sitekey: siteKey,
			size: 'invisible',
		} );
		debug( 'renderRecaptchaClient: [Success]', elementId );
		return clientId;
	} catch ( error ) {
		debug( 'renderRecaptchaClient: [Error]', error );
		return null;
	}
}

/**
 * Records an arbitrary action to Google reCAPTCHA
 *
 * @param {number} clientId - a clientId of the reCAPTCHA instance
 * @param {string} action  - name of action to record in reCAPTCHA
 */
export async function recordGoogleRecaptchaAction( clientId, action ) {
	if ( ! window.grecaptcha ) {
		debug(
			'recordGoogleRecaptchaAction: [Error] window.grecaptcha not defined. Did you forget to init?'
		);
		return null;
	}

	try {
		const token = await window.grecaptcha.execute( clientId, { action } );
		debug( 'recordGoogleRecaptchaAction: [Success]', action, token, clientId );
		return token;
	} catch ( error ) {
		debug( 'recordGoogleRecaptchaAction: [Error]', action, error );
		return null;
	}
}

/**
 * @typedef RecaptchaActionResult
 * @property {string} token
 * @property {number} clientId
 */

/**
 * Records reCAPTCHA action, loading Google script if necessary.
 *
 * @param {string} elementId - a DOM id in which to render the reCAPTCHA client
 * @param {string} action - name of action to record in reCAPTCHA
 * @param {string} siteKey - reCAPTCHA site key
 *
 * @returns {RecaptchaActionResult|null} either the reCAPTCHA token and clientId, or null if the function fails
 */
export async function initGoogleRecaptcha( elementId, action, siteKey ) {
	if ( ! siteKey ) {
		return null;
	}

	if ( ! ( await loadGoogleRecaptchaScript() ) ) {
		return null;
	}

	await new Promise( ( resolve ) => window.grecaptcha.ready( resolve ) );

	try {
		const clientId = await renderRecaptchaClient( elementId, siteKey );
		if ( clientId == null ) {
			return null;
		}

		const token = await recordGoogleRecaptchaAction( clientId, action );
		if ( token == null ) {
			return null;
		}

		debug( 'initGoogleRecaptcha: [Success]', action, token, clientId );
		return { token, clientId };
	} catch ( error ) {
		// We don't want errors interrupting our flow, so convert any exceptions
		// into return values.
		debug( 'initGoogleRecaptcha: [Error]', action, error );
		return null;
	}
}
