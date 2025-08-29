import wpcom from 'calypso/lib/wp';

export interface DomainAvailability {
	mappable:
		| 'available'
		| 'available_premium'
		| 'available_reserved'
		| 'availability_check_error'
		| 'conflicting_cname_exists'
		| 'blacklisted_domain'
		| 'domain_availability_throttle'
		| 'domain_suggestions_throttled'
		| 'dotblog_subdomain'
		| 'empty_query'
		| 'empty_results'
		| 'forbidden_domain'
		| 'forbidden_subdomain'
		| 'in_redemption'
		| 'invalid_domain'
		| 'invalid_length'
		| 'invalid_query'
		| 'invalid_tld'
		| 'tld_in_maintenance'
		| 'mappable'
		| 'mapped_domain'
		| 'mapped_to_other_site_same_user'
		| 'mapped_to_other_site_same_user_registrable'
		| 'mapped_to_same_site_not_transferrable'
		| 'mapped_to_same_site_transferrable'
		| 'mapped_to_same_site_registrable'
		| 'not_available'
		| 'available_but_not_registrable'
		| 'domain_registration_unavailable'
		| 'recent_registration_lock_not_transferrable'
		| 'recently_mapped'
		| 'recently_expired'
		| 'registered_domain'
		| 'registered_on_other_site_same_user'
		| 'registered_on_same_site'
		| 'restricted_domain'
		| 'server_transfer_prohibited_not_transferrable'
		| 'tld_not_supported'
		| 'tld_not_supported_and_domain_not_available'
		| 'tld_not_supported_temporarily'
		| 'transfer_pending'
		| 'transfer_pending_same_user'
		| 'transferrable'
		| 'transferrable_premium'
		| 'unknown'
		| 'unknown_active_domain_with_wpcom'
		| 'wpcom_staging_domain';
	root_domain_provider: string;
}

export function fetchDomainAvailability( domainName: string ): Promise< DomainAvailability > {
	return wpcom.req.get( `/domains/${ encodeURIComponent( domainName ) }/is-available`, {
		apiVersion: '1.3',
		is_cart_pre_check: false,
	} );
}
