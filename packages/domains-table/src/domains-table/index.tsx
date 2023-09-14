import { isMobile } from '@automattic/viewport';
import { DomainsTable as InternalDomainsTable, DomainsTablePropsNoChildren } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableBulkUpdateNotice } from './domains-table-bulk-update-notice';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableMobileCards } from './domains-table-mobile-cards';
import { DomainsTableToolbar } from './domains-table-toolbar';

import './style.scss';

export function DomainsTable( props: DomainsTablePropsNoChildren ) {
	return (
		<InternalDomainsTable { ...props }>
			<DomainsTableBulkUpdateNotice />
			<DomainsTableToolbar />
			{ isMobile() ? (
				<DomainsTableMobileCards />
			) : (
				<table>
					<DomainsTableHeader />
					<DomainsTableBody />
				</table>
			) }
		</InternalDomainsTable>
	);
}
