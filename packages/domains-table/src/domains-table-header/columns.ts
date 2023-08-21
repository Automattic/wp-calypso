import { __ } from '@wordpress/i18n';
import { getSimpleSortFunctionBy } from '../utils';
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
];
