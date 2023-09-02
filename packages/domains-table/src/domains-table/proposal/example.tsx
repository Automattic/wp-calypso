import { DomainsTableHeader } from '../../domains-table-header/index';
import { DomainsTable, DomainsTableProps } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableToolbar } from './domains-table-toolbar';

import '../style.scss';

export function Example( props: Omit< DomainsTableProps, 'children' > ) {
	return (
		<DomainsTable { ...props }>
			<DomainsTableToolbar />

			<table>
				<DomainsTableHeader />
				<DomainsTableBody />
			</table>
		</DomainsTable>
	);
}
