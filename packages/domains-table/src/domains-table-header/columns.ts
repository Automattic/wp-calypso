import { __, _n, sprintf } from '@wordpress/i18n';
import { I18N } from 'i18n-calypso';
import { getSimpleSortFunctionBy, getStatusSortFunctions } from '../utils';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
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

export const allSitesViewColumns = (
	translate: I18N[ 'translate' ],
	domainStatusPurchaseActions?: DomainStatusPurchaseActions
): DomainsTableColumn[] => [
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
		sortFunctions: [ getSimpleSortFunctionBy( 'owner' ) ],
	},
	{
		name: 'site',
		label: __( 'Site', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'blog_name' ) ],
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
		sortFunctions: getStatusSortFunctions( translate, domainStatusPurchaseActions ),
	},
	{
		name: 'status_action',
		label: null,
		isSortable: false,
	},
	{ name: 'action', label: null, className: 'domains-table__action-ellipsis-column-header' },
];

export const siteSpecificViewColumns = (
	translate: I18N[ 'translate' ],
	domainStatusPurchaseActions?: DomainStatusPurchaseActions
): DomainsTableColumn[] => [
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
		sortFunctions: [ getSimpleSortFunctionBy( 'owner' ) ],
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
		sortFunctions: getStatusSortFunctions( translate, domainStatusPurchaseActions ),
	},
	{
		name: 'status_action',
		label: null,
		isSortable: false,
	},
	{ name: 'action', label: null, className: 'domains-table__action-ellipsis-column-header' },
];
