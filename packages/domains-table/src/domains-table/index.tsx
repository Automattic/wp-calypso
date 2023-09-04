import { DomainsTable as InternalDomainsTable, DomainsTableProps } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableToolbar } from './domains-table-toolbar';

import './style.scss';

export function DomainsTable( props: DomainsTableProps ) {
	return (
		<InternalDomainsTable { ...props }>
			<DomainsTableToolbar />

			<table>
				<DomainsTableHeader />
				<DomainsTableBody />
			</table>
		</InternalDomainsTable>
	);
}
