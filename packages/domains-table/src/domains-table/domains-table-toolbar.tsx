import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect, useRef } from 'react';
import { BulkActionsToolbar } from '../bulk-actions-toolbar/index';
import { DomainsTableFilters } from '../domains-table-filters/index';
import { useDomainsTable } from './domains-table';

import './style.scss';

export function DomainsTableToolbar() {
	const {
		hasSelectedDomains,
		handleAutoRenew,
		handleUpdateContactInfo,
		selectedDomains,
		filter,
		setFilter,
		currentUsersOwnsAllSelectedDomains,
		currentUserCanBulkUpdateContactInfo,
	} = useDomainsTable();

	const isMobile = useMobileBreakpoint();
	const domainsTableToolbar = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! domainsTableToolbar.current ) {
			return;
		}

		if ( isMobile ) {
			domainsTableToolbar.current.style.top = `${ domainsTableToolbar.current.offsetTop }px`;
		} else {
			domainsTableToolbar.current.style.top = 'unset';
		}
	}, [ isMobile ] );

	return (
		<div className="domains-table-toolbar" ref={ domainsTableToolbar }>
			{ hasSelectedDomains ? (
				<BulkActionsToolbar
					onAutoRenew={ handleAutoRenew }
					onUpdateContactInfo={ handleUpdateContactInfo }
					selectedDomainCount={ selectedDomains.size }
					canUpdateContactInfo={
						currentUsersOwnsAllSelectedDomains && currentUserCanBulkUpdateContactInfo
					}
				/>
			) : (
				<DomainsTableFilters
					onSearch={ ( query ) => setFilter( ( filter ) => ( { ...filter, query } ) ) }
					filter={ filter }
				/>
			) }
		</div>
	);
}
