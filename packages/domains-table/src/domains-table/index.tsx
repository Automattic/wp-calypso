import { useMobileBreakpoint } from '@automattic/viewport-react';
import { DomainsTable as InternalDomainsTable, DomainsTablePropsNoChildren } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableBulkUpdateNotice } from './domains-table-bulk-update-notice';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableMobileCards } from './domains-table-mobile-cards';
import { DomainsTableToolbar } from './domains-table-toolbar';
import './style.scss';

export function DomainsTable( props: DomainsTablePropsNoChildren ) {
	const isMobile = useMobileBreakpoint();

	return (
		<InternalDomainsTable { ...props }>
			<DomainsTableBulkUpdateNotice />
			<DomainsTableToolbar />
			{ isMobile ? (
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
