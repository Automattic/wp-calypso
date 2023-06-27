import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type DomainLockResponse = {
	transfer_restriction_status?: string;
	transfer_eligible_date?: any;
	term_maximum_in_years?: number;
	admin_email?: string;
	creation_date?: string;
	registrar?: string;
	registrar_iana_id?: string;
	privacy?: boolean;
	unlocked: boolean | 'unknown';
	in_redemption?: boolean;
};

export function useIsDomainsUnlocked( domain: string, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-lock-check', domain ],
		queryFn: () =>
			wpcomRequest< DomainLockResponse >( {
				apiVersion: '1.1',
				path: `/domains/${ encodeURIComponent( domain ) }/inbound-transfer-status`,
			} ),
		staleTime: 5 * 60 * 1000,
		keepPreviousData: true,
		...queryOptions,
	} );
}
