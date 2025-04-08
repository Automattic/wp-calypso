import config from '@automattic/calypso-config';
import { DomainData } from '@automattic/data-stores';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { ReactNode } from 'react';
import {
	DomainsTableProps,
	DomainsTableStateContext,
	useGenerateDomainsTableState,
} from './domains-table';
import { DomainsTableBody } from './domains-table-body';
import { DomainsTableBulkUpdateNotice } from './domains-table-bulk-update-notice';
import { DomainsTableHeader } from './domains-table-header';
import { DomainsTableMobileCards } from './domains-table-mobile-cards';
import { DomainsTableToolbar } from './domains-table-toolbar';
import './style.scss';

export function DomainsTable( props: DomainsTableProps & { footer?: ReactNode } ) {
	const { className, hideCheckbox, footer, useMobileCards, ...allProps } = props;

	const isMobile = useMobileBreakpoint();

	const state = useGenerateDomainsTableState( allProps );

	const { isAllSitesView, domains, sidebarMode } = props;

	const showDomainsToolbar =
		isAllSitesView ||
		( ! isAllSitesView &&
			( ( domains as unknown as DomainData[] ) ?? [] ).filter(
				( domain ) => ! domain?.is_subdomain
			).length > 1 );

	const isDomainsDataViewsEnabled = config.isEnabled( 'calypso/domains-dataviews' );
	const showBulkUpdateNotice = ! isDomainsDataViewsEnabled;

	return (
		<DomainsTableStateContext.Provider value={ state }>
			<div className={ clsx( className, 'domains-table' ) }>
				{ showBulkUpdateNotice && <DomainsTableBulkUpdateNotice /> }
				{ showDomainsToolbar && <DomainsTableToolbar /> }
				{ useMobileCards ?? isMobile ? (
					<DomainsTableMobileCards />
				) : (
					<table
						className={ clsx( `is-${ state.domainsTableColumns.length }-column`, {
							'has-checkbox': state.canSelectAnyDomains && ! hideCheckbox,
						} ) }
					>
						{ ! sidebarMode && <DomainsTableHeader /> }
						<DomainsTableBody />
					</table>
				) }
				{ props.footer }
			</div>
		</DomainsTableStateContext.Provider>
	);
}
