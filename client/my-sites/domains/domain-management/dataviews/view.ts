import { View } from '@wordpress/dataviews';
import {
	DEFAULT_PAGE,
	DEFAULT_PER_PAGE,
	DEFAULT_SORT_FIELD,
	DEFAULT_SORT_DIRECTION,
	QueryParams,
} from './query-params';

export function getFieldsByBreakpoint( isDesktop: boolean, sidebarMode?: boolean ) {
	if ( isDesktop && ! sidebarMode ) {
		return [ 'owner', 'site', 'ssl_status', 'expiry', 'domain_status' ];
	}

	return [];
}

export function initializeViewState(
	isDesktop: boolean,
	{ page, perPage, search, sortField, sortDirection }: QueryParams,
	sidebarMode?: boolean
) {
	const initialViewState: View = {
		filters: [],
		sort: {
			field: sortField || DEFAULT_SORT_FIELD,
			direction: sortDirection || DEFAULT_SORT_DIRECTION,
		},
		page: page || DEFAULT_PAGE,
		perPage: perPage || DEFAULT_PER_PAGE,
		search: search || '',
		type: sidebarMode ? 'list' : 'table',
		showMedia: false,
		titleField: 'domain_name',
		descriptionField: 'domain_type',
		fields: getFieldsByBreakpoint( isDesktop, sidebarMode ),
	};

	if ( initialViewState.type === 'table' && initialViewState.layout ) {
		initialViewState.layout.styles = {
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
		};
	}

	return initialViewState;
}
