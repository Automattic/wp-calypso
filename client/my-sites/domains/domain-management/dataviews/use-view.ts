import { View } from '@wordpress/dataviews';
import { useState } from 'react';
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
