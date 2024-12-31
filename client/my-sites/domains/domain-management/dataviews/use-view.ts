import { View } from '@wordpress/dataviews';
import { useState } from 'react';

type ViewProps = {
	sidebarMode?: boolean;
	isDesktop: boolean;
};

export function getFieldsByBreakpoint( isDesktop: boolean, sidebarMode?: boolean ) {
	if ( isDesktop && ! sidebarMode ) {
		return [ 'domain_name', 'owner', 'site', 'ssl_status', 'expiry', 'domain_status' ];
	}

	return [ 'domain_name' ];
}

export default function useView( { sidebarMode, isDesktop }: ViewProps ) {
	const initialDataViewsState: View = {
		filters: [],
		sort: {
			field: '',
			direction: 'asc',
		},
		type: sidebarMode ? 'list' : 'table',
		perPage: 50,
		page: 1,
		search: '',
		layout: {},
	};

	const [ view, setView ] = useState< View >( () => ( {
		...initialDataViewsState,
		perPage: 15,
		search: '',
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
