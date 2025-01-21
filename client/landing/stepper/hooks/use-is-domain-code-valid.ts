import { keepPreviousData, useQuery } from '@tanstack/react-query';
import sha256 from 'hash.js/lib/hash/sha/256';
import wpcomRequest from 'wpcom-proxy-request';
import { DomainValidationOptions } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/domain-transfer-domains/use-validation-message';
import { domainAvailability } from 'calypso/lib/domains/constants';

const VERSION = 2;

/**
 * Irreversibly hash the auth code to avoid storing it as query key.
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
	is_price_limit_exceeded?: boolean;
	cannot_transfer_due_to_unsupported_premium_tld?: boolean;
};

type DomainCodePair = {
	domain: string;
	auth: string;
	options?: DomainValidationOptions;
};

export function useIsDomainCodeValid( pair: DomainCodePair, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-code-valid', VERSION, pair.domain, hashAuthCode( pair.auth ) ],
		queryFn: async () => {
			try {
				const options = ! pair.options
					? {}
					: Object.entries( pair.options ).reduce(
							( acc, [ key, value ] ) => {
								acc[ key ] = String( value );
								return acc;
							},
							{} as Record< string, string >
					  );
				const availability = await wpcomRequest< DomainLockResponse >( {
					apiVersion: '1.3',
					path: `/domains/${ encodeURIComponent( pair.domain ) }/is-available`,
					query: new URLSearchParams( options ).toString(),
				} );

				// A `transferrability` property was added in D115244-code to check whether a mapped domain can be transferred
				const isUnlocked =
					[
						domainAvailability.TRANSFERRABLE,
						domainAvailability.TRANSFERRABLE_PREMIUM,
						domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE,
					].includes( availability.status ) ||
					( [ domainAvailability.MAPPED, domainAvailability.MAPPED_OTHER_SITE_SAME_USER ].includes(
						availability.status
					) &&
						[ domainAvailability.TRANSFERRABLE, domainAvailability.TRANSFERRABLE_PREMIUM ].includes(
							availability?.transferrability ?? ''
						) );

				if ( ! isUnlocked || availability?.is_price_limit_exceeded === true ) {
					return {
						domain: pair.domain,
						tld: availability.tld,
						status: availability.status,
						unlocked: false,
						transferrability: availability.transferrability,
						is_price_limit_exceeded: availability?.is_price_limit_exceeded,
						cannot_transfer_due_to_unsupported_premium_tld:
							availability?.cannot_transfer_due_to_unsupported_premium_tld,
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
					cannot_transfer_due_to_unsupported_premium_tld:
						availability?.cannot_transfer_due_to_unsupported_premium_tld,
				};
			} catch ( error ) {
				return {
					error: 'Failed to check domain lock status.',
				};
			}
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		...queryOptions,
	} );
}
