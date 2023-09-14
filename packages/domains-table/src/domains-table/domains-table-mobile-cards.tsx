import { useDomainsTable } from './domains-table';
import { DomainsTableMobileCard } from './domains-table-mobile-card';

export const DomainsTableMobileCards = () => {
	const { filteredData } = useDomainsTable();

	return filteredData.map( ( domain ) => (
		<DomainsTableMobileCard key={ domain.domain } domain={ domain } />
	) );
};
