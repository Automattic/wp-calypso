import { fetchDomains } from '../../data/domains';

export const domainsQuery = () => ( {
	queryKey: [ 'domains' ],
	queryFn: fetchDomains,
} );
