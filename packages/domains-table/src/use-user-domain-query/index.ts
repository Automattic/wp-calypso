import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface Domain {
	domain: string;
	blog_id: number;
	blog_name: string;
	domain_status: string;
	expiry: string;
	has_registration: boolean;
	is_hundred_year_domain: boolean;
	registration_date: string;
	site_slug: string;
	ssl_status: string;
	type: string;
	auto_renewing: boolean;
}

interface DomainsResponse {
	domains: Domain[];
	meta: {
		total: number;
		page: number;
		per_page: number;
	};
}

export const useUserDomainQuery = () => {
	const { data, ...queryResult } = useQuery< DomainsResponse >( {
		queryKey: [ 'domains', 'user' ],
		queryFn: () =>
			wpcomRequest( {
				apiNamespace: 'wpcom/v2',
				path: '/domains/list/mine',
				method: 'GET',
			} ),
	} );

	const domains = Array.isArray( data ) ? data : [];

	return {
		domains,
		...queryResult,
	};
};
