import type { Domain } from '../../data/domain';
import type { User } from '../../data/me';
import type { Site } from '../../data/site';

export const WPCOM_DEFAULT_NAMESERVERS_REGEX = /^ns[1-4]\.wordpress\.com$/i;

export const HOSTNAME_REGEX =
	/^(?=.{1,255}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const validateHostname = ( hostname: string ) => {
	return HOSTNAME_REGEX.test( hostname );
};

export const areAllWpcomNameServers = ( nameservers?: string[] ) => {
	if ( ! nameservers || nameservers.length === 0 ) {
		return false;
	}

	return nameservers.every( ( nameserver: string ) => {
		return ! nameserver || WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
	} );
};

export const shouldShowUpsellNudge = ( user: User, domain: Domain, site?: Site ): boolean => {
	if (
		! site?.plan?.is_free || // hide nudge for paid plans
		! user.meta.data.flags.active_flags.includes(
			'calypso_allow_nonprimary_domains_without_plan'
		) ||
		! domain.points_to_wpcom ||
		domain.wpcom_domain ||
		domain.primary_domain ||
		domain.is_domain_only_site ||
		domain.is_wpcom_staging_domain
	) {
		return false;
	}

	return true;
};
