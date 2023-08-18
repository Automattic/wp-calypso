import { translate } from 'i18n-calypso';
import { getSimpleSortFunctionBy } from '../utils';
import { DomainsTableColumn } from '.';

export const domainsTableColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: translate( 'Domain' ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
	},
];
