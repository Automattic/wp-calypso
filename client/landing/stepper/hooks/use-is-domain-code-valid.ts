import { useQuery } from '@tanstack/react-query';
import sha256 from 'hash.js/lib/hash/sha/256';
import wpcomRequest from 'wpcom-proxy-request';

const VERSION = 2;

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
	transferrability?: string;
	raw_price?: number;
	sale_cost?: number;
	currency_code?: string;
	tld?: string;
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

				// A `transferrability` property was added in D115244-code to check whether a mapped domain can be transferred
				const isUnlocked =
					[ 'transferrable', 'mapped_to_same_site_transferrable' ].includes(
						availability.status
					) ||
					( [ 'mapped_domain', 'mapped_to_other_site_same_user' ].includes( availability.status ) &&
						'transferrable' === availability?.transferrability );

				if ( ! isUnlocked ) {
					return {
						domain: pair.domain,
						tld: availability.tld,
						status: availability.status,
						unlocked: false,
						transferrability: availability.transferrability,
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
					transferrability: availability.transferrability,
					raw_price: availability.raw_price,
					sale_cost: availability.sale_cost,
					currency_code: availability.currency_code,
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
