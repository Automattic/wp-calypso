import { useMobileBreakpoint } from '@automattic/viewport-react';
import { ReactNode } from 'react';
import { DomainsTable as InternalDomainsTable, DomainsTablePropsNoChildren } from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableBulkUpdateNotice } from './domains-table-bulk-update-notice';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableMobileCards } from './domains-table-mobile-cards';
import { DomainsTableToolbar } from './domains-table-toolbar';
import './style.scss';

export function DomainsTable( props: DomainsTablePropsNoChildren & { footer?: ReactNode } ) {
	const isMobile = useMobileBreakpoint();
	const { footer, ...allProps } = props;

	return (
		<InternalDomainsTable { ...allProps }>
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
			{ props.footer }
		</InternalDomainsTable>
	);
}
