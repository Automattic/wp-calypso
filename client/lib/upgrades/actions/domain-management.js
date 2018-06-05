/** @format **/
/**
 * Externel dependencies
 */
import { noop } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import DnsStore from 'lib/domains/dns/store';
import EmailForwardingStore from 'lib/domains/email-forwarding/store';
import NameserversStore from 'lib/domains/nameservers/store';
import { requestSite } from 'state/sites/actions';
import wapiDomainInfoAssembler from 'lib/domains/wapi-domain-info/assembler';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import whoisAssembler from 'lib/domains/whois/assembler';
import WhoisStore from 'lib/domains/whois/store';
import wp from 'lib/wp';
import debugFactory from 'debug';
import { isBeingProcessed } from 'lib/domains/dns';
import { fetchSiteDomains } from 'state/sites/domains/actions';

const debug = debugFactory( 'actions:domain-management' );

const wpcom = wp.undocumented();

export const setPrimaryDomain = ( siteId, domainName, onComplete = noop ) => dispatch => {
	debug( 'setPrimaryDomain', siteId, domainName );
	Dispatcher.handleViewAction( {
		type: ActionTypes.PRIMARY_DOMAIN_SET,
		siteId,
	} );
	wpcom.setPrimaryDomain( siteId, domainName, ( error, data ) => {
		if ( error ) {
			return onComplete( error, data );
		}

		fetchSiteDomains( siteId )( dispatch ).then( () => {
			onComplete( null, data );
			requestSite( siteId )( dispatch );
		} );
	} );
};

export function fetchEmailForwarding( domainName ) {
	const emailForwarding = EmailForwardingStore.getByDomainName( domainName );

	if ( ! emailForwarding.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.EMAIL_FORWARDING_FETCH,
		domainName,
	} );

	wpcom.emailForwards( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_FETCH_FAILED,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_FETCH_COMPLETED,
				domainName,
				forwards: data.forwards,
			} );
		}
	} );
}

export function addEmailForwarding( domainName, mailbox, destination, onComplete ) {
	wpcom.addEmailForward( domainName, mailbox, destination, error => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_ADD_COMPLETED,
				domainName,
				mailbox,
				destination,
			} );
			fetchEmailForwarding( domainName );
		}

		onComplete( error );
	} );
}

export function deleteEmailForwarding( domainName, mailbox, onComplete ) {
	wpcom.deleteEmailForward( domainName, mailbox, error => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_DELETE_COMPLETED,
				domainName,
				mailbox,
			} );
			fetchEmailForwarding( domainName );
		}

		onComplete( error );
	} );
}

export function resendVerificationEmailForwarding( domainName, mailbox, onComplete ) {
	wpcom.resendVerificationEmailForward( domainName, mailbox, onComplete );
}

/**
 * Gets the current WHOIS data for `domainName` from the backend
 *
 * @param {String} domainName - current domain name
 */
export function fetchWhois( domainName ) {
	const whois = WhoisStore.getByDomainName( domainName );

	if ( ! whois.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.WHOIS_FETCH,
		domainName,
	} );

	wpcom.fetchWhois( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WHOIS_FETCH_FAILED,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WHOIS_FETCH_COMPLETED,
				domainName,
				data: whoisAssembler.createDomainWhois( data ),
			} );
		}
	} );
}

/**
 * Posts new WHOIS contact information data for `domainName` to the backend
 *
 * @param {String} domainName - current domain name
 * @param {Object} registrantContactDetails - registrant contact details to be sent to server
 * @param {Boolean} transferLock - state of opt-out of the 60-day transfer lock checkbox
 * @param {Function} onComplete - callback after HTTP action
 */
export function updateWhois( domainName, registrantContactDetails, transferLock, onComplete ) {
	wpcom.updateWhois( domainName, registrantContactDetails, transferLock, ( error, data ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WHOIS_UPDATE_COMPLETED,
				domainName,
				registrantContactDetails,
			} );

			// For WWD the update may take longer
			// After 1 minute, we mark the WHOIS as needing updating
			setTimeout( () => {
				Dispatcher.handleServerAction( {
					type: ActionTypes.WHOIS_UPDATE_COMPLETED,
					domainName,
					registrantContactDetails,
				} );
			}, 60000 );
		}

		onComplete( error, data );
	} );
}

export function fetchDns( domainName ) {
	const dns = DnsStore.getByDomainName( domainName );

	if ( dns.isFetching || dns.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.DNS_FETCH,
		domainName,
	} );

	wpcom.fetchDns( domainName, ( error, data ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DNS_FETCH_COMPLETED,
				records: data && data.records,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DNS_FETCH_FAILED,
				domainName,
			} );
		}
	} );
}

export function addDns( domainName, record, onComplete ) {
	Dispatcher.handleServerAction( {
		type: ActionTypes.DNS_ADD,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.updateDns( domainName, dns.records, error => {
		const type = ! error ? ActionTypes.DNS_ADD_COMPLETED : ActionTypes.DNS_ADD_FAILED;
		Dispatcher.handleServerAction( {
			type,
			domainName,
			record,
		} );

		onComplete( error );
	} );
}

export function deleteDns( domainName, record, onComplete ) {
	if ( isBeingProcessed( record ) ) {
		return;
	}

	Dispatcher.handleServerAction( {
		type: ActionTypes.DNS_DELETE,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.updateDns( domainName, dns.records, error => {
		const type = ! error ? ActionTypes.DNS_DELETE_COMPLETED : ActionTypes.DNS_DELETE_FAILED;

		Dispatcher.handleServerAction( {
			type,
			domainName,
			record,
		} );

		onComplete( error );
	} );
}

export function applyDnsTemplate( domainName, provider, service, variables, onComplete ) {
	wpcom.applyDnsTemplate( domainName, provider, service, variables, ( error, data ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DNS_APPLY_TEMPLATE_COMPLETED,
				records: data && data.records,
				domainName,
			} );
		}
		onComplete( error );
	} );
}

export function fetchNameservers( domainName ) {
	const nameservers = NameserversStore.getByDomainName( domainName );

	if ( nameservers.isFetching || nameservers.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.NAMESERVERS_FETCH,
		domainName,
	} );

	wpcom.nameservers( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_FETCH_FAILED,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_FETCH_COMPLETED,
				domainName,
				nameservers: data,
			} );
		}
	} );
}

export function updateNameservers( domainName, nameservers, onComplete ) {
	const postData = nameservers.map( nameserver => {
		return {
			nameserver,
		};
	} );

	wpcom.updateNameservers( domainName, { nameservers: postData }, error => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_UPDATE_COMPLETED,
				domainName,
				nameservers,
			} );
		}

		onComplete( error );
	} );
}

export function resendIcannVerification( domainName, onComplete ) {
	wpcom.resendIcannVerification( domainName, error => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.ICANN_VERIFICATION_RESEND_COMPLETED,
				domainName,
			} );
		}

		onComplete( error );
	} );
}

export function closeSiteRedirectNotice( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_NOTICE_CLOSE,
		siteId,
	} );
}

export function fetchSiteRedirect( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_FETCH,
		siteId,
	} );

	wpcom.getSiteRedirect( siteId, ( error, data ) => {
		if ( data && data.location ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_COMPLETED,
				location: data.location,
				siteId,
			} );
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_FAILED,
				error: error.message,
				siteId,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_FAILED,
				error: i18n.translate(
					'There was a problem retrieving the redirect settings. Please try again later or contact support.'
				),
				siteId,
			} );
		}
	} );
}

export function updateSiteRedirect( siteId, location, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_UPDATE,
		siteId,
	} );

	wpcom.setSiteRedirect( siteId, location, ( error, data ) => {
		let success = false;

		if ( data && data.success ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_COMPLETED,
				location,
				siteId,
				success: i18n.translate( 'The redirect settings were updated successfully.' ),
			} );

			success = true;
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_FAILED,
				error: error.message,
				siteId,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_FAILED,
				error: i18n.translate(
					'There was a problem updating the redirect settings. Please try again later or contact support.'
				),
				siteId,
			} );
		}

		onComplete( success );
	} );
}

export function fetchWapiDomainInfo( domainName ) {
	const wapiDomainInfo = WapiDomainInfoStore.getByDomainName( domainName );

	if ( ! wapiDomainInfo.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.WAPI_DOMAIN_INFO_FETCH,
		domainName,
	} );

	wpcom.fetchWapiDomainInfo( domainName, ( error, status ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WAPI_DOMAIN_INFO_FETCH_FAILED,
				error,
				domainName,
			} );

			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.WAPI_DOMAIN_INFO_FETCH_COMPLETED,
			status: wapiDomainInfoAssembler.createDomainObject( status ),
			domainName,
		} );
	} );
}

export function requestTransferCode( options, onComplete ) {
	const { siteId, domainName, unlock, disablePrivacy } = options;

	wpcom.requestTransferCode( options, error => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
			siteId,
			domainName,
			unlock,
			disablePrivacy,
		} );

		onComplete( null );
	} );
}

export function cancelTransferRequest( options, onComplete ) {
	wpcom.cancelTransferRequest( options, error => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
			domainName: options.domainName,
			locked: options.lockDomain,
		} );

		if ( options.enablePrivacy ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED,
				siteId: options.siteId,
				domainName: options.domainName,
			} );
		}

		onComplete( null );
	} );
}

export function enablePrivacyProtection( { siteId, domainName }, onComplete ) {
	wpcom.enablePrivacyProtection( domainName, error => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED,
			siteId,
			domainName,
		} );

		onComplete( null );
	} );
}

export function acceptTransfer( domainName, onComplete ) {
	wpcom.acceptTransfer( domainName, error => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_ACCEPT_COMPLETED,
			domainName,
		} );

		onComplete( null );
	} );
}

export function declineTransfer( domainName, onComplete ) {
	wpcom.declineTransfer( domainName, error => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_DECLINE_COMPLETED,
			domainName,
		} );

		onComplete( null );
	} );
}

export function requestGdprConsentManagementLink( domainName, onComplete ) {
	wpcom.requestGdprConsentManagementLink( domainName, onComplete );
}
