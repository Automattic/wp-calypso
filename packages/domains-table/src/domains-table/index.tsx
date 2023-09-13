import { DomainsTable as InternalDomainsTable, DomainsTablePropsNoChildren } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableBulkUpdateNotice } from './domains-table-bulk-update-notice';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableToolbar } from './domains-table-toolbar';

import './style.scss';

export function DomainsTable( props: DomainsTablePropsNoChildren ) {
	return (
		<InternalDomainsTable { ...props }>
			<DomainsTableBulkUpdateNotice />
			<DomainsTableToolbar />
			<table>
				<DomainsTableHeader />
				<DomainsTableBody />
			</table>
		</InternalDomainsTable>
	);
}
