import wpcomProxyRequest from 'wpcom-proxy-request';

interface DomainSuggestion {
	domain_name: string;
	cost: string;
}

const fetchDomainSuggestions = async ( query: string ): Promise< DomainSuggestion[] > => {
	return wpcomProxyRequest( {
		apiVersion: '1.1',
		path: '/domains/suggestions',
		query: new URLSearchParams( {
			query,
		} ).toString(),
	} );
};

export const domainSuggestionsQuery = ( { query }: { query: string } ) => {
	return {
		queryKey: [ 'domain-suggestions', query ],
		queryFn: () => fetchDomainSuggestions( query ),
	};
};
