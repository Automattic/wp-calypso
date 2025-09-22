import { isSupportSession } from '@automattic/calypso-support-session';
import { __, sprintf } from '@wordpress/i18n';
import type { Domain } from '@automattic/api-core';

/**
 * Individual domain check functions
 * Each function checks a specific condition and returns true if the check passes, false if it fails
 */
type DomainCheckFunction = ( domain: Domain ) => boolean;

const checkNotInSupportSession: DomainCheckFunction = () => ! isSupportSession();

const checkCurrentUserIsOwner: DomainCheckFunction = ( domain: Domain ) =>
	!! domain.current_user_is_owner;

const checkNotRedeemable: DomainCheckFunction = ( domain: Domain ) => ! domain.is_redeemable;

const checkNotHundredYearDomain: DomainCheckFunction = ( domain: Domain ) =>
	! domain.is_hundred_year_domain;

const checkNotPendingRegistration: DomainCheckFunction = ( domain: Domain ) =>
	! domain.is_pending_registration && ! domain.is_pending_registration_at_registry;

const checkNotAftermarketAuction: DomainCheckFunction = ( domain: Domain ) =>
	! domain.aftermarket_auction;

const checkCanTransferToAnyUser: DomainCheckFunction = ( domain: Domain ) =>
	!! domain.can_transfer_to_any_user;

const checkCanManageNameServers: DomainCheckFunction = ( domain: Domain ) =>
	!! domain.can_manage_name_servers;

const checkCanUpdateContactInfo: DomainCheckFunction = ( domain: Domain ) =>
	!! domain.can_update_contact_info;

const checkNotPendingWhoisUpdate: DomainCheckFunction = ( domain: Domain ) =>
	! domain.is_pending_whois_update;

const checkCanManageDnsRecords: DomainCheckFunction = ( domain: Domain ) =>
	!! domain.can_manage_dns_records;

const checkNominetPendingOrSuspended: DomainCheckFunction = ( domain: Domain ) =>
	domain.nominet_pending_contact_verification_request || domain.nominet_domain_suspended;

export const PermissionCheck = {
	TRANSFER: 'transfer',
	NAME_SERVERS: 'name-servers',
	CONTACT_INFO: 'contact-info',
	DNS_RECORDS: 'dns-records',
	CONTACT_VERIFICATION: 'contact-verification',
} as const;

/**
 * Permission configuration maps
 * Each permission type defines which checks are required and their corresponding error messages
 */
const DOMAIN_PERMISSION_CHECKS = {
	[ PermissionCheck.TRANSFER ]: [
		{
			check: checkNotInSupportSession,
			getErrorMessage: () =>
				__(
					'Transfers cannot be initiated in a support session - please ask the user to do it instead'
				),
		},
		{
			check: checkCurrentUserIsOwner,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name, owner is the owner of the domain */
					__( '%(domain)s can be transferred only by the user {{strong}}%(owner)s{{/strong}}.' ),
					{ domain: domain.domain, owner: domain.owner }
				),
		},
		{
			check: checkNotRedeemable,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name */
					__( '%(domain)s is in redemption so it is not possible to transfer it.' ),
					{ domain: domain.domain }
				),
		},
		{
			check: checkNotHundredYearDomain,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name */
					__( '%(domain)s is a 100-year domain and cannot be transferred.' ),
					{ domain: domain.domain }
				),
		},
		{
			check: checkNotPendingRegistration,
			getErrorMessage: () =>
				__(
					'We are still setting up your domain. You will not be able to transfer it until the registration setup is done.'
				),
		},
		{
			check: checkNotAftermarketAuction,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name */
					__(
						'%(domain)s expired over 30 days ago and has been offered for sale at auction. Currently it is not possible to renew it.'
					),
					{ domain: domain.domain }
				),
		},
		{
			check: checkCanTransferToAnyUser,
			getErrorMessage: () => __( 'You do not have permission to transfer this domain.' ),
		},
	],
	[ PermissionCheck.NAME_SERVERS ]: [
		{
			check: checkCanManageNameServers,
			getErrorMessage: ( domain: Domain ) =>
				domain.cannot_manage_name_servers_reason ||
				__( 'You do not have permission to manage name servers.' ),
		},
	],
	[ PermissionCheck.DNS_RECORDS ]: [
		{
			check: checkCanManageDnsRecords,
			getErrorMessage: ( domain: Domain ) =>
				domain.cannot_manage_dns_records_reason ||
				__( 'You do not have permission to manage DNS.' ),
		},
	],
	[ PermissionCheck.CONTACT_INFO ]: [
		{
			check: checkNotInSupportSession,
			getErrorMessage: () =>
				__(
					'Contact info cannot be managed in a support session - please ask the user to do it instead'
				),
		},
		{
			check: checkCurrentUserIsOwner,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name, owner is the owner of the domain */
					__( '%(domain)s contact info can be managed only by the user %(owner)s.' ),
					{ domain: domain.domain, owner: domain.owner }
				),
		},
		{
			check: checkCanUpdateContactInfo,
			getErrorMessage: ( domain: Domain ) =>
				domain.cannot_update_contact_info_reason ||
				__( 'You do not have permission to update contact info.' ),
		},
		{
			check: checkNotPendingWhoisUpdate,
			getErrorMessage: () => __( 'Domain is pending contact information update.' ),
		},
	],
	[ PermissionCheck.CONTACT_VERIFICATION ]: [
		{
			check: checkCurrentUserIsOwner,
			getErrorMessage: ( domain: Domain ) =>
				sprintf(
					/* translators: domain is the domain name, owner is the owner of the domain */
					__( '%(domain)s contact verification can be managed only by the user %(owner)s.' ),
					{ domain: domain.domain, owner: domain.owner }
				),
		},
		{
			check: checkNominetPendingOrSuspended,
			getErrorMessage: () => __( 'This domain does not require contact verification.' ),
		},
	],
} as const;

function checkDomainPermissions(
	domain: Domain,
	permissionType: ( typeof PermissionCheck )[ keyof typeof PermissionCheck ]
): void {
	const checks = DOMAIN_PERMISSION_CHECKS[ permissionType ];

	for ( const { check, getErrorMessage } of checks ) {
		if ( ! check( domain ) ) {
			throw new Error( getErrorMessage( domain ) );
		}
	}
}

export function checkDomainTransferPermissions( domain: Domain ): void {
	checkDomainPermissions( domain, PermissionCheck.TRANSFER );
}

export function checkDomainNameServersPermissions( domain: Domain ): void {
	checkDomainPermissions( domain, PermissionCheck.NAME_SERVERS );
}

export function checkDomainContactInfoPermissions( domain: Domain ): void {
	checkDomainPermissions( domain, PermissionCheck.CONTACT_INFO );
}

export function checkDomainDnsRecordsPermissions( domain: Domain ): void {
	checkDomainPermissions( domain, PermissionCheck.DNS_RECORDS );
}

export function checkDomainContactVerificationPermissions( domain: Domain ): void {
	checkDomainPermissions( domain, PermissionCheck.CONTACT_VERIFICATION );
}
