import { __, _n, sprintf } from '@wordpress/i18n';
import { getSimpleSortFunctionBy, getSiteSortFunctions } from '../utils';
import { DomainsTableColumn } from '.';

export const domainsTableColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: ( count: number ) =>
			sprintf(
				/* translators: Heading which displays the number of domains in a table */
				_n( '%(count)d domain', '%(count)d domains', count, __i18n_text_domain__ ),
				{ count }
			),
		sortLabel: __( 'Domain', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
		width: '25%',
	},
	{
		name: 'owner',
		label: __( 'Owner', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
		width: '20%',
	},
	{
		name: 'site',
		label: __( 'Site', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: getSiteSortFunctions(),
		width: '20%',
	},
	{
		name: 'expire_renew',
		label: __( 'Expires / renews on', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
		width: '15%',
	},
	{
		name: 'status',
		label: __( 'Status', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'desc',
		supportsOrderSwitching: true,
		sortFunctions: [],
		width: '15%',
	},
	{ name: 'action', label: null },
];
