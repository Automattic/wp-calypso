import { useQuery } from './use-query';

export function useDomainParams(): { domain: string | null; provider: string | null } {
	const query = useQuery();
	return {
		domain: query.get( 'domain' ),
		provider: query.get( 'provider' ),
	};
}
