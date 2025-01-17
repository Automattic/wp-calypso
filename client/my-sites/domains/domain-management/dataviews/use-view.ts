import { usePrevious } from '@wordpress/compose';
import { View } from '@wordpress/dataviews';
import { useEffect, useRef, useState } from 'react';
import {
	DEFAULT_PAGE,
	DEFAULT_PER_PAGE,
	DEFAULT_SORT_FIELD,
	DEFAULT_SORT_DIRECTION,
	QueryParams,
} from './use-query-params';

type ViewProps = {
	sidebarMode?: boolean;
	isDesktop: boolean;
	selectedDomain?: string;
	queryParams: QueryParams;
};

export function getFieldsByBreakpoint( isDesktop: boolean, sidebarMode?: boolean ) {
	if ( isDesktop && ! sidebarMode ) {
		return [ 'domain_name', 'owner', 'site', 'ssl_status', 'expiry', 'domain_status' ];
	}

	return [ 'domain_name' ];
}

export default function useView( {
	sidebarMode,
	isDesktop,
	queryParams: { page, perPage, search, sortField, sortDirection },
}: ViewProps ) {
	const initialDataViewsState: View = {
		filters: [],
		sort: {
			field: sortField || DEFAULT_SORT_FIELD,
			direction: sortDirection || DEFAULT_SORT_DIRECTION,
		},
		page: page || DEFAULT_PAGE,
		perPage: perPage || DEFAULT_PER_PAGE,
		search: search || '',
		type: sidebarMode ? 'list' : 'table',
		layout: {},
	};

	const [ view, setView ] = useState< View >( () => ( {
		...initialDataViewsState,
		fields: getFieldsByBreakpoint( isDesktop, sidebarMode ),
		layout: {
			primaryField: 'domain_name',
			styles: {
				domain_name: {
					minWidth: '1fr',
					maxWidth: '2fr',
				},
				owner: {
					width: '2fr',
				},
				blog_name: {},
				ssl: {
					width: '50px',
				},
				expiration: {},
				status: {},
			},
		},
	} ) );

	return {
		view,
		setView,
	};
}

// DataViews' pagination always resets when the search component is mounted, even though the search term has not changed.
// This is a bug which has a fix in https://github.com/WordPress/gutenberg/pull/61307.
// This is a workaround until the above fix is released.
// Here, we restore the page to the previous page if it is unintentionally changed by the above bug.
export function useInitializeDataViewsPage< V extends View >(
	dataViewsState: V,
	setDataViewsState: ( state: V ) => void
) {
	const prevPage = usePrevious( dataViewsState.page );
	const prevSearch = usePrevious( dataViewsState.search );

	const done = useRef( false );

	useEffect( () => {
		if ( prevPage === 1 ) {
			done.current = true;
		}
		if ( done.current ) {
			return;
		}

		if ( dataViewsState.search === prevSearch && dataViewsState.page !== prevPage ) {
			setDataViewsState( {
				...dataViewsState,
				page: prevPage,
			} );
			done.current = true;
		}
	}, [ dataViewsState, prevPage, prevSearch, setDataViewsState ] );
}
