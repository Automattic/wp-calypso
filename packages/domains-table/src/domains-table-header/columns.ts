import { __, _n, sprintf } from '@wordpress/i18n';
import { getSimpleSortFunctionBy, getSiteSortFunctions } from '../utils';
import { DomainsTableColumn } from '.';

const domainLabel = ( count: number, isBulkSelection: boolean ) =>
	isBulkSelection
		? sprintf(
				/* translators: Heading which displays the number of selected domains in a table */
				_n(
					'%(count)d domain selected',
					'%(count)d domains selected',
					count,
					__i18n_text_domain__
				),
				{ count }
		  )
		: sprintf(
				/* translators: Heading which displays the number of domains in a table */
				_n( '%(count)d domain', '%(count)d domains', count, __i18n_text_domain__ ),
				{ count }
		  );

export const allSitesViewColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: domainLabel,
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
		name: 'expire_renew',
		label: __( 'Expires / renews on', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
	},
	{
		name: 'status',
		label: __( 'Status', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'desc',
		supportsOrderSwitching: true,
		sortFunctions: [],
	},
	{ name: 'action', label: null, className: 'domains-table__action-ellipsis-column-header' },
];

export const siteSpecificViewColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: domainLabel,
		sortLabel: __( 'Domain', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
		width: '35%',
	},
	{
		name: 'owner',
		label: __( 'Owner', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
	},
	{
		name: 'email',
		label: __( 'Email', __i18n_text_domain__ ),
		isSortable: false,
	},
	{
		name: 'expire_renew',
		label: __( 'Expires / renews on', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
	},
	{
		name: 'status',
		label: __( 'Status', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'desc',
		supportsOrderSwitching: true,
		sortFunctions: [],
	},
	{ name: 'action', label: null, className: 'domains-table__action-ellipsis-column-header' },
];
