/** @format */

/**
 * Internal dependencies
 */
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_RECEIVE,
	EMAIL_FORWARDING_FAILURE,
} from 'state/action-types';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {String}   domainName  domainName
 * @return {Function}        Action thunk
 */
export const requestEmailForwarding = domainName => {
	return dispatch => {
		dispatch( {
			type: EMAIL_FORWARDING_REQUEST,
			domainName,
		} );

		return wpcom
			.emailForwards( domainName )
			.then( data => {
				dispatch( {
					type: EMAIL_FORWARDING_RECEIVE,
					domainName,
					data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: EMAIL_FORWARDING_FAILURE,
					domainName,
					error,
				} );
			} );
	};
};

// export const receiveEmailForwards = ( siteId, domainName, data ) => ( {
// 	type: EMAIL_FORWARDING_RECEIVE,
// 	siteId,
// 	domainName,
// 	data,
// } );

// export const failedRequestEmailForwards = ( siteId, domainName, error ) => ( {
// 	type: EMAIL_FORWARDING_FAILURE,
// 	siteId,
// 	domainName,
// 	error,
// } );

// export

// export function fetchEmailForwarding( domainName ) {
// 	const emailForwarding = EmailForwardingStore.getByDomainName( domainName );

// 	if ( ! emailForwarding.needsUpdate ) {
// 		return;
// 	}

// 	Dispatcher.handleViewAction( {
// 		type: EMAIL_FORWARDING_REQUEST,
// 		domainName,
// 	} );

// 	wpcom.emailForwards( domainName, ( error, data ) => {
// 		if ( error ) {
// 			Dispatcher.handleServerAction( {
// 				type: EMAIL_FORWARDING_FAILURE,
// 				domainName,
// 			} );
// 		} else {
// 			Dispatcher.handleServerAction( {
// 				type: EMAIL_FORWARDING_RECEIVE,
// 				domainName,
// 				forwards: data.forwards,
// 			} );
// 		}
// 	} );
// }

// export function addEmailForwarding( domainName, mailbox, destination, onComplete ) {
// 	wpcom.addEmailForward( domainName, mailbox, destination, error => {
// 		if ( ! error ) {
// 			Dispatcher.handleServerAction( {
// 				type: EMAIL_FORWARDING_ADD_COMPLETED,
// 				domainName,
// 				mailbox,
// 				destination,
// 			} );
// 			fetchEmailForwarding( domainName );
// 		}

// 		onComplete( error );
// 	} );
// }

// export function deleteEmailForwarding( domainName, mailbox, onComplete ) {
// 	wpcom.deleteEmailForward( domainName, mailbox, error => {
// 		if ( ! error ) {
// 			Dispatcher.handleServerAction( {
// 				type: EMAIL_FORWARDING_DELETE_COMPLETED,
// 				domainName,
// 				mailbox,
// 			} );
// 			fetchEmailForwarding( domainName );
// 		}

// 		onComplete( error );
// 	} );
// }

// export function resendVerificationEmailForwarding( domainName, mailbox, onComplete ) {
// 	wpcom.resendVerificationEmailForward( domainName, mailbox, onComplete );
// }
