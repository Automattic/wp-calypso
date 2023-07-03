import { useQuery } from '@tanstack/react-query';
import sha256 from 'hash.js/lib/hash/sha/256';
import wpcomRequest from 'wpcom-proxy-request';

const VERSION = 1;

/**
 * Irreversibly hash the auth code to avoid storing it as query key.
 *
 * @param code The domain auth code.
 * @returns the hash.
 */
function hashAuthCode( code: string ) {
	return sha256().update( code ).digest( 'hex' );
}

type DomainCodeResponse = {
	success: boolean;
};

type DomainLockResponse = {
	transfer_restriction_status?: string;
	transfer_eligible_date?: any;
	term_maximum_in_years?: number;
	admin_email?: string;
	creation_date?: string;
	registrar?: string;
	registrar_iana_id?: string;
	privacy?: boolean;
	unlocked: boolean | null | undefined;
	in_redemption?: boolean;
	status: string;
};

type DomainCodePair = { domain: string; auth: string };

export function useIsDomainCodeValid( pair: DomainCodePair, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-code-valid', VERSION, pair.domain, hashAuthCode( pair.auth ) ],
		queryFn: async () => {
			try {
				const availability = await wpcomRequest< DomainLockResponse >( {
					apiVersion: '1.3',
					path: `/domains/${ encodeURIComponent( pair.domain ) }/is-available`,
				} );

				// The "mapped_*" statuses here are a quick and dirty fix to allow bulk transfer of already connected domains for now.
				// The "transferrable" status should be the only one that indicates a domain can be transferred. There are some domains that
				// can be mapped but can't be transferred
				const isUnlocked = [
					'transferrable',
					'mapped_to_other_site_same_user',
					'mapped_to_same_site_transferrable',
					'mapped_domain',
				].includes( availability.status );

				if ( ! isUnlocked ) {
					return {
						domain: pair.domain,
						status: availability.status,
						unlocked: false,
						auth_code_valid: false,
					};
				}

				const response = await wpcomRequest< DomainCodeResponse >( {
					apiVersion: '1.1',
					path: `/domains/${ encodeURIComponent( pair.domain ) }/inbound-transfer-check-auth-code`,
					query: `auth_code=${ encodeURIComponent( pair.auth ) }`,
				} ).catch( () => ( { success: false } ) );

				return {
					domain: pair.domain,
					registered: true,
					unlocked: true,
					auth_code_valid: response.success,
					status: availability.status,
				};
			} catch ( error ) {
				return {
					error: 'Failed to check domain lock status.',
				};
			}
		},
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		keepPreviousData: true,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		...queryOptions,
	} );
}
