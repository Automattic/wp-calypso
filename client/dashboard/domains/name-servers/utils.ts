import type { Domain, User, Site } from '@automattic/api-core';

export const WPCOM_DEFAULT_NAMESERVERS_REGEX = /^ns[1-4]\.wordpress\.com$/i;

export const HOSTNAME_REGEX =
	/^(?=.{1,255}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const validateHostname = ( hostname: string ) => {
	return HOSTNAME_REGEX.test( hostname );
};

export const shouldShowUpsellNudge = ( user: User, domain: Domain, site?: Site ): boolean => {
	if (
		! site?.plan?.is_free || // hide nudge for paid plans
		! user.meta.data.flags.active_flags.includes(
			'calypso_allow_nonprimary_domains_without_plan'
		) ||
		domain.primary_domain ||
		domain.is_domain_only_site
	) {
		return false;
	}

	return true;
};
