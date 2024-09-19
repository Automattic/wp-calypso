import { getDomainId } from '../get-domain-id';
import { useDomainsTable } from './domains-table';
import { DomainsTableRow } from './domains-table-row';
import DomainsTableRowLoading from './domains-table-row-loading';

import './style.scss';

export function DomainsTableBody() {
	const { filteredData, isLoadingDomains } = useDomainsTable();

	if ( isLoadingDomains ) {
		return (
			<tbody>
				<DomainsTableRowLoading />
				<DomainsTableRowLoading />
			</tbody>
		);
	}

	return (
		<tbody>
			{ filteredData.map( ( domain ) => (
				<DomainsTableRow key={ getDomainId( domain ) } domain={ domain } />
			) ) }
		</tbody>
	);
}
