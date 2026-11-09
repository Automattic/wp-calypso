import { translate } from 'i18n-calypso';
import { resendIcannVerification } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import {
	DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_SAVE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_UPDATE,
} from 'calypso/state/action-types';
import {
	errorNotice,
	infoNotice,
	removeNotice,
	successNotice,
} from 'calypso/state/notices/actions';
import type { WhoisData } from './types';
import type { CalypsoDispatch } from 'calypso/state/types';

import 'calypso/state/domains/init';

/**
 * Returns an action object to be used in signalling that a WHOIS details
 * object has been received.
 */
export function receiveWhois( domain: string, whoisData: WhoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
		domain,
		whoisData,
	};
}

/**
 * Triggers a network request to query WHOIS details
 */
export function requestWhois( domain: string ) {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_REQUEST,
			domain,
		} );

		return wpcom.req
			.get( `/domains/${ domain }/whois` )
			.then( ( whoisData: WhoisData ) => {
				dispatch( receiveWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
					domain,
				} );
			} )
			.catch( ( error: Error ) => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
					domain,
					error,
				} );
			} );
	};
}

/**
 * Sends a network request to the server to save updated WHOIS details
 * at the domain's registrar.
 * @param   {string}   domain		domain to query
 * @param   {Object}   whoisData	whois details object
 * @param	  {boolean}  transferLock set 60-day transfer lock after update
 * @returns {Function}				Action thunk
 */
export function saveWhois( domain: string, whoisData: WhoisData, transferLock: boolean ) {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_SAVE,
			domain,
		} );

		return wpcom.req
			.post( `/domains/${ domain }/whois`, {
				whois: whoisData,
				transfer_lock: transferLock,
			} )
			.then( ( data: WhoisData ) => {
				dispatch( updateWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
					domain,
					data,
				} );
			} )
			.catch( ( error: Error ) => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
					domain,
					error,
				} );
			} );
	};
}

export function updateWhois( domain: string, whoisData: WhoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_UPDATE,
		domain,
		whoisData,
	};
}

export const showUpdatePrimaryDomainSuccessNotice = ( domainName: string ) => {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch(
			successNotice(
				translate(
					'Primary domain changed: all domains will redirect to {{em}}%(domainName)s{{/em}}.',
					{ args: { domainName }, components: { em: <em /> } }
				),
				{ duration: 10000, isPersistent: true }
			)
		);
	};
};

export const showUpdatePrimaryDomainErrorNotice = ( errorMessage: string ) => {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch(
			errorNotice(
				errorMessage ||
					translate( "Something went wrong and we couldn't change your primary domain." ),
				{ duration: 10000, isPersistent: true }
			)
		);
	};
};

export const verifyIcannEmail = ( domain: string ) => {
	return ( dispatch: CalypsoDispatch ) => {
		const noticeId = 'icann-email-notice';

		dispatch( removeNotice( noticeId ) );

		dispatch( infoNotice( translate( 'Sending email…' ), { id: noticeId, duration: 4000 } ) );

		resendIcannVerification( domain )
			.then( () => {
				dispatch( removeNotice( noticeId ) );

				dispatch(
					successNotice(
						translate(
							'We sent the ICANN verification email to your ' +
								'email address. Please check your inbox and click the link in the email.'
						)
					)
				);
			} )
			.catch( ( error: Error ) => {
				dispatch( removeNotice( noticeId ) );

				dispatch( errorNotice( error.message ) );
			} );
	};
};
