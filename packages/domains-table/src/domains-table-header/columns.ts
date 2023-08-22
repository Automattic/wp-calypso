import { __ } from '@wordpress/i18n';
import { getSimpleSortFunctionBy, getSiteSortFunctions } from '../utils';
import { DomainsTableColumn } from '.';

export const domainsTableColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: __( 'Domain', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
	},
	{
		name: 'site',
		label: __( 'Site', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: getSiteSortFunctions(),
	},
	{
		name: 'status',
		label: __( 'Status', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'desc',
		supportsOrderSwitching: true,
		sortFunctions: [],
	},
	{
		name: 'registered-until',
		label: __( 'Registered until', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
	},
	{ name: 'auto-renew', label: __( 'Auto-renew', __i18n_text_domain__ ) },
	{ name: 'action', label: __( 'Actions', __i18n_text_domain__ ) },
];
