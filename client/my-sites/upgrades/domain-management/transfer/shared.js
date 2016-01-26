/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { translate } from 'lib/mixins/i18n'

export const displayResponseError = ( responseError ) => {
	const errorMessages = {
		unlock_domain_and_disable_private_reg_failed: translate(
			'The domain could not be unlocked. ' +
			'Additionally, Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to these errors.'
		),
		unlock_domain_failed: translate(
			'The domain could not be unlocked. ' +
			'The transfer will most likely fail due to this error.'
		),
		disable_private_reg_failed: translate(
			'Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to this error.'
		)
	};

	if ( responseError.error && Object.keys( errorMessages ).indexOf( responseError.error ) !== - 1 ) {
		notices.error(
			translate(
				'An error occurred while trying to send the Domain Transfer code: {{strong}}%s{{/strong}} ' +
				'Please {{a}}Contact Support{{/a}}.',
				{
					args: errorMessages[ responseError.error ],
					components: {
						strong: <strong />,
						a: <a href="https://support.wordpress.com/contact/" target="_blank"/>
					}
				}
			)
		);
	} else {
		notices.error(
			translate(
				'An error occurred while trying to send the Domain Transfer code. ' +
				'Please try again or {{a}}Contact Support{{/a}} if you continue ' +
				'to have trouble.',
				{
					components: {
						a: <a href="https://support.wordpress.com/contact/" target="_blank"/>
					}
				}
			)
		);
	}
};

export const displayRequestTransferCodeResponseNotice = ( responseError, domainStatus ) => {
	if ( responseError ) {
		displayResponseError( responseError );
		return;
	}

	if ( domainStatus.manualTransferRequired ) {
		notices.success(
			translate(
				'The registry for your domain requires a special process for transfers. ' +
				'Our Happiness Engineers have been notified about your transfer request and will be in touch ' +
				'shortly to help you complete the process.'
			)
		);
	} else {
		notices.success(
			translate(
				'We have sent the transfer authorization code to the domain registrant\'s email address. ' +
				'If you don\'t receive the email shortly, please check your spam folder.'
			)
		);
	}
};

/**
 * Converts async (wpcom) calls to promises by pushing a callback handler to the arguments list. The handler will resolve or
 * reject depending on the value.
 *
 * This only works with functions with the following convention:
 * - Accepts a callback as the last argument
 * - Calls the callback with arguments like (error, result) similar to node.JS style
 *
 * E.g.
 * Previous:
 * wpcom.undocumented().getSitePlans( siteId, ( error, data ) => {
 * 	if ( error ) {
 * 		debug( 'Fetching site plans failed: ', error );
 * 	} else {
 * 		dispatch( fetchSitePlansCompleted( siteId, data ) );
 * 	}
 * 	resolve();
 * } );
 *
 * promisy( wpcom.undocumented().getSitePlans )( siteId ).then( ( data ) => {
 * 	dispatch( fetchSitePlansCompleted( siteId, data ) );
 * }, ( error ) => {
 * 	debug( 'Fetching site plans failed: ', error );
 * } );
 *
 * @param {Function} fn - Function to be wrapped
 * @returns {Function} Wrapped function which returns a Promise
 */
export const promisy = ( fn ) => {
	return function( ...args ) {
		return new Promise( function( resolve, reject ) {
			args.push( function( error, res ) {
				if ( error ) {
					reject( error )
				} else {
					resolve( res )
				}
			} );
			fn.apply( fn, args );
		} );
	}
};
