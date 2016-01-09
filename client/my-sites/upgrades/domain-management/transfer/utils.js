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
			'Additionally, Private Registration could not be disabled. ' +
			'The transfer will most likely fail due to these errors.'
		),
		unlock_domain_failed: translate(
			'The domain could not be unlocked. ' +
			'The transfer will most likely fail due to this error.'
		),
		disable_private_reg_failed: translate(
			'Private Registration could not be disabled. ' +
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
				'Our support team has been notified and will contact you once we ' +
				'receive the transfer code for this domain.'
			)
		);
	} else {
		notices.success(
			translate(
				"An email has been sent to the Domain Registrant's contact email " +
				"address containing the Domain Transfer Code. If you don't " +
				'receive the email shortly, please check your spam folder.'
			)
		);
	}
};


/**
 * Converts async (wpcom) calls to promises by pushing a callback handler to the arguments list. The handler will resolve or
 * reject depending on the value.
 * @param {Function} fn - Function to be converted into
 * @param {...Array} args - List of arguments
 * @returns {Promise} Promise
 */
export const promisy = ( fn, ...args ) => {
	return new Promise( function( resolve, reject ) {
		args.push( function( error ) {
			if ( error ) {
				reject( error )
			} else {
				resolve( true )
			}
		} );
		fn.apply( fn, args );
	} );
};
