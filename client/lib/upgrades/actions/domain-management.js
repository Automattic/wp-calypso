/**
 * Externel dependencies
 */
import noop from 'lodash/noop';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import { isInitialized as isDomainInitialized } from 'lib/domains';
import Dispatcher from 'dispatcher';
import DnsStore from 'lib/domains/dns/store';
import domainsAssembler from 'lib/domains/assembler';
import DomainsStore from 'lib/domains/store';
import EmailForwardingStore from 'lib/domains/email-forwarding/store';
import NameserversStore from 'lib/domains/nameservers/store';
import sitesFactory from 'lib/sites-list';
import wapiDomainInfoAssembler from 'lib/domains/wapi-domain-info/assembler';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import whoisAssembler from 'lib/domains/whois/assembler';
import WhoisStore from 'lib/domains/whois/store';
import wp from 'lib/wp';
import debugFactory from 'debug';
import { isBeingProcessed } from 'lib/domains/dns';

const debug = debugFactory( 'actions:domain-management' );

const sites = sitesFactory(),
	wpcom = wp.undocumented();

function setPrimaryDomain( siteId, domainName, onComplete = noop ) {
	debug( 'setPrimaryDomain', siteId, domainName );
	Dispatcher.handleViewAction( {
		type: ActionTypes.PRIMARY_DOMAIN_SET,
		siteId
	} );
	wpcom.setPrimaryDomain( siteId, domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIMARY_DOMAIN_SET_FAILED,
				error: error && error.message || i18n.translate( 'There was a problem setting the primary domain. Please try' +
					' again later or contact support.' ),
				siteId,
				domainName
			} );

			return onComplete( error, data );
		}

		sites.setSelectedSite( siteId );

		Dispatcher.handleServerAction( {
			type: 'FETCH_SITES'
		} );

		sites.once( 'change', () => {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIMARY_DOMAIN_SET_COMPLETED,
				siteId,
				domainName
			} );

			onComplete( null, data );
			fetchDomains( siteId );
		} );
	} );
}

function fetchEmailForwarding( domainName ) {
	const emailForwarding = EmailForwardingStore.getByDomainName( domainName );

	if ( ! emailForwarding.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.EMAIL_FORWARDING_FETCH,
		domainName
	} );

	wpcom.emailForwards( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_FETCH_FAILED,
				domainName
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_FETCH_COMPLETED,
				domainName,
				forwards: data.forwards
			} );
		}
	} );
}

function addEmailForwarding( domainName, mailbox, destination, onComplete ) {
	wpcom.addEmailForward( domainName, mailbox, destination, ( error ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_ADD_COMPLETED,
				domainName,
				mailbox,
				destination
			} );
			fetchEmailForwarding( domainName );
		}

		onComplete( error );
	} );
}

function deleteEmailForwarding( domainName, mailbox, onComplete ) {
	wpcom.deleteEmailForward( domainName, mailbox, ( error ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.EMAIL_FORWARDING_DELETE_COMPLETED,
				domainName,
				mailbox
			} );
			fetchEmailForwarding( domainName );
		}

		onComplete( error );
	} );
}

function resendVerificationEmailForwarding( domainName, mailbox, onComplete ) {
	wpcom.resendVerificationEmailForward( domainName, mailbox, onComplete );
}

function fetchDomains( siteId ) {
	if ( ! isDomainInitialized( DomainsStore.get(), siteId ) ) {
		Dispatcher.handleViewAction( {
			type: ActionTypes.DOMAINS_INITIALIZE,
			siteId
		} );
	}

	const domains = DomainsStore.getBySite( siteId );
	if ( domains.isFetching ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.DOMAINS_FETCH,
		siteId
	} );

	wpcom.site( siteId ).domains( function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DOMAINS_FETCH_FAILED,
				siteId,
				error
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DOMAINS_FETCH_COMPLETED,
				siteId,
				domains: domainsAssembler.createDomainObjects( data.domains )
			} );
		}
	} );
}

function fetchWhois( domainName ) {
	const whois = WhoisStore.getByDomainName( domainName );

	if ( ! whois.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.WHOIS_FETCH,
		domainName
	} );

	wpcom.fetchWhois( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WHOIS_FETCH_FAILED,
				domainName
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WHOIS_FETCH_COMPLETED,
				domainName,
				data: whoisAssembler.createDomainObject( data )
			} );
		}
	} );
}

function updateWhois( domainName, contactInformation, onComplete ) {
	wpcom.updateWhois( domainName, contactInformation, ( error, data ) => {
		if ( ! error ) {
			// update may take a few minutes, we try after 1 minute to see if it is already done
			setTimeout( () => {
				Dispatcher.handleServerAction( {
					type: ActionTypes.WHOIS_UPDATE_COMPLETED,
					domainName
				} );
				fetchWhois( domainName );
			}, 60000 );
		}

		onComplete( error, data );
	} );
}

function fetchDns( domainName ) {
	const dns = DnsStore.getByDomainName( domainName );

	if ( dns.isFetching || dns.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.DNS_FETCH,
		domainName
	} );

	wpcom.fetchDns( domainName, ( error, data ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DNS_FETCH_COMPLETED,
				records: data && data.records,
				domainName
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DNS_FETCH_FAILED,
				domainName
			} );
		}
	} );
}

function addDns( domainName, record, onComplete ) {
	Dispatcher.handleServerAction( {
		type: ActionTypes.DNS_ADD,
		domainName,
		record
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.updateDns( domainName, dns.records, ( error ) => {
		const type = ! error ? ActionTypes.DNS_ADD_COMPLETED : ActionTypes.DNS_ADD_FAILED;
		Dispatcher.handleServerAction( {
			type,
			domainName,
			record
		} );

		onComplete( error );
	} );
}

function deleteDns( domainName, record, onComplete ) {
	if ( isBeingProcessed( record ) ) {
		return;
	}

	Dispatcher.handleServerAction( {
		type: ActionTypes.DNS_DELETE,
		domainName,
		record
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.updateDns( domainName, dns.records, ( error ) => {
		const type = ! error ? ActionTypes.DNS_DELETE_COMPLETED : ActionTypes.DNS_DELETE_FAILED;

		Dispatcher.handleServerAction( {
			type,
			domainName,
			record,
		} );

		onComplete( error );
	} );
}

function fetchNameservers( domainName ) {
	const nameservers = NameserversStore.getByDomainName( domainName );

	if ( nameservers.isFetching || nameservers.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.NAMESERVERS_FETCH,
		domainName
	} );

	wpcom.nameservers( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_FETCH_FAILED,
				domainName
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_FETCH_COMPLETED,
				domainName,
				nameservers: data
			} );
		}
	} );
}

function updateNameservers( domainName, nameservers, onComplete ) {
	const postData = nameservers.map( ( nameserver ) => {
		return {
			nameserver
		};
	} );

	wpcom.updateNameservers( domainName, { nameservers: postData }, ( error ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.NAMESERVERS_UPDATE_COMPLETED,
				domainName,
				nameservers
			} );
		}

		onComplete( error );
	} );
}

function resendIcannVerification( domainName, onComplete ) {
	wpcom.resendIcannVerification( domainName, ( error ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.ICANN_VERIFICATION_RESEND_COMPLETED,
				domainName
			} );
		}

		onComplete( error );
	} );
}

function closeSiteRedirectNotice( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_NOTICE_CLOSE,
		siteId
	} );
}

function fetchSiteRedirect( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_FETCH,
		siteId
	} );

	wpcom.getSiteRedirect( siteId, ( error, data ) => {
		if ( data && data.location ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_COMPLETED,
				location: data.location,
				siteId
			} );
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_FAILED,
				error: error.message,
				siteId
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_FETCH_FAILED,
				error: i18n.translate( 'There was a problem retrieving the redirect settings. Please try again later or contact support.' ),
				siteId
			} );
		}
	} );
}

function updateSiteRedirect( siteId, location, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SITE_REDIRECT_UPDATE,
		siteId
	} );

	wpcom.setSiteRedirect( siteId, location, ( error, data ) => {
		let success = false;

		if ( data && data.success ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_COMPLETED,
				location,
				siteId,
				success: i18n.translate( 'The redirect settings were updated successfully.' )
			} );

			success = true;
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_FAILED,
				error: error.message,
				siteId
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.SITE_REDIRECT_UPDATE_FAILED,
				error: i18n.translate( 'There was a problem updating the redirect settings. Please try again later or contact support.' ),
				siteId
			} );
		}

		onComplete( success );
	} );
}

function fetchWapiDomainInfo( domainName ) {
	const wapiDomainInfo = WapiDomainInfoStore.getByDomainName( domainName );

	if ( ! wapiDomainInfo.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.WAPI_DOMAIN_INFO_FETCH,
		domainName
	} );

	wpcom.fetchWapiDomainInfo( domainName, ( error, status ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.WAPI_DOMAIN_INFO_FETCH_FAILED,
				error,
				domainName
			} );

			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.WAPI_DOMAIN_INFO_FETCH_COMPLETED,
			status: wapiDomainInfoAssembler.createDomainObject( status ),
			domainName
		} );
	} );
}

function requestTransferCode( options, onComplete ) {
	const { siteId, domainName, unlock, disablePrivacy } = options;

	wpcom.requestTransferCode( options, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
			siteId,
			domainName,
			unlock,
			disablePrivacy
		} );

		onComplete( null );
	} );
}

function enableDomainLocking( options, onComplete ) {
	wpcom.enableDomainLocking( options, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_LOCKING_ENABLE_COMPLETED,
			domainName: options.domainName
		} );

		if ( options.enablePrivacy ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED,
				siteId: options.siteId,
				domainName: options.domainName
			} );
		}

		onComplete( null );
	} );
}

function enablePrivacyProtection( { siteId, domainName }, onComplete ) {
	wpcom.enablePrivacyProtection( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED,
			siteId,
			domainName
		} );

		onComplete( null );
	} );
}

function acceptTransfer( domainName, onComplete ) {
	wpcom.acceptTransfer( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_ACCEPT_COMPLETED,
			domainName
		} );

		onComplete( null );
	} );
}

function declineTransfer( domainName, onComplete ) {
	wpcom.declineTransfer( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: ActionTypes.DOMAIN_TRANSFER_DECLINE_COMPLETED,
			domainName
		} );

		onComplete( null );
	} );
}

export {
	acceptTransfer,
	addDns,
	addEmailForwarding,
	closeSiteRedirectNotice,
	declineTransfer,
	deleteDns,
	deleteEmailForwarding,
	enableDomainLocking,
	enablePrivacyProtection,
	fetchDns,
	fetchDomains,
	fetchEmailForwarding,
	fetchNameservers,
	fetchSiteRedirect,
	fetchWapiDomainInfo,
	fetchWhois,
	requestTransferCode,
	resendIcannVerification,
	resendVerificationEmailForwarding,
	setPrimaryDomain,
	updateNameservers,
	updateSiteRedirect,
	updateWhois
};
