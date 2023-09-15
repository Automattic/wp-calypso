import { getDomainId } from '../get-domain-id';
import { useDomainsTable } from './domains-table';
import { DomainsTableRow } from './domains-table-row';

import './style.scss';

export function DomainsTableBody() {
	const { filteredData } = useDomainsTable();

	return (
		<tbody>
			{ filteredData.map( ( domain ) => (
				<DomainsTableRow key={ getDomainId( domain ) } domain={ domain } />
			) ) }
		</tbody>
	);
}
