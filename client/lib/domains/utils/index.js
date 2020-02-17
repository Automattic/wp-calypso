/**
 * External dependencies
 */
import { drop, join, get, split, startsWith } from 'lodash';
import moment from 'moment';
/**
 * Internal dependencies
 */
import { type as domainTypes, transferStatus, gdprConsentStatus } from './constants';

export function getDomainType( domainFromApi ) {
	if ( domainFromApi.type === 'redirect' ) {
		return domainTypes.SITE_REDIRECT;
	}

	if ( domainFromApi.type === 'transfer' ) {
		return domainTypes.TRANSFER;
	}

	if ( domainFromApi.wpcom_domain ) {
		return domainTypes.WPCOM;
	}

	if ( domainFromApi.has_registration ) {
		return domainTypes.REGISTERED;
	}

	return domainTypes.MAPPED;
}

export function getTransferStatus( domainFromApi ) {
	if ( domainFromApi.transfer_status === 'pending_owner' ) {
		return transferStatus.PENDING_OWNER;
	}

	if ( domainFromApi.transfer_status === 'pending_registry' ) {
		return transferStatus.PENDING_REGISTRY;
	}

	if ( domainFromApi.transfer_status === 'cancelled' ) {
		return transferStatus.CANCELLED;
	}

	if ( domainFromApi.transfer_status === 'completed' ) {
		return transferStatus.COMPLETED;
	}

	if ( domainFromApi.transfer_status === 'pending_start' ) {
		return transferStatus.PENDING_START;
	}

	return null;
}

export function getGdprConsentStatus( domainFromApi ) {
	switch ( domainFromApi.gdpr_consent_status ) {
		case 'NONE':
			return gdprConsentStatus.NONE;
		case 'PENDING':
			return gdprConsentStatus.PENDING;
		case 'PENDING_ASYNC':
			return gdprConsentStatus.PENDING_ASYNC;
		case 'ACCEPTED_CONTRACTUAL_MINIMUM':
			return gdprConsentStatus.ACCEPTED_CONTRACTUAL_MINIMUM;
		case 'ACCEPTED_FULL':
			return gdprConsentStatus.ACCEPTED_FULL;
		case 'DENIED':
			return gdprConsentStatus.DENIED;
		case 'FORCED_ALL_CONTRACTUAL':
			return gdprConsentStatus.FORCED_ALL_CONTRACTUAL;
		default:
			return null;
	}
}

export function getDomainRegistrationAgreementUrl( domainFromApi ) {
	return get( domainFromApi, 'domain_registration_agreement_url', null );
}

export function isDomainConnectAuthorizePath( path ) {
	return startsWith( path, '/domain-connect/authorize/' );
}

export function parseDomainAgainstTldList( domainFragment, tldList ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList[ domainFragment ] !== undefined ) {
		return domainFragment;
	}

	const parts = split( domainFragment, '.' );
	const suffix = join( drop( parts ), '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}

export function isRecentlyRegistered( registrationDate ) {
	return moment.utc( registrationDate ).isAfter( moment.utc().subtract( 30, 'minutes' ) );
}
