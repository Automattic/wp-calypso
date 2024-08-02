import { DomainData, PartialDomainData } from '@automattic/data-stores';
import { __, _n, sprintf } from '@wordpress/i18n';
import { I18N } from 'i18n-calypso';
import { getSimpleSortFunctionBy, getStatusSortFunctions } from '../utils';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
import { DomainsTableColumn } from '.';

const domainLabel = ( count: number, isBulkSelection: boolean, showCount: boolean = true ) => {
	if ( ! showCount ) {
		return __( 'Domain', __i18n_text_domain__ );
	}

	return isBulkSelection
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
};

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
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ) ],
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
	{
		name: 'action',
		label: __( 'Actions', __i18n_text_domain__ ),
	},
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
		name: 'ssl',
		label: __( 'SSL', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
	},
	{
		name: 'expire_renew',
		label: __( 'Expires / renews on', __i18n_text_domain__ ),
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
		sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ) ],
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
	{
		name: 'action',
		label: __( 'Actions', __i18n_text_domain__ ),
	},
];
export const applyColumnSort = (
	domains: PartialDomainData[],
	domainData: Record< number, DomainData[] >,
	columns: DomainsTableColumn[],
	sortKey: string,
	sortDirection: 'asc' | 'desc'
) => {
	const selectedColumnDefinition = columns.find( ( column ) => column.name === sortKey );

	const getFullDomainData = ( domain: PartialDomainData ) =>
		domainData[ domain.blog_id ]?.find( ( d ) => d.domain === domain.domain );

	return [ ...domains ].sort( ( first, second ) => {
		let result = 0;

		const fullFirst = getFullDomainData( first );
		const fullSecond = getFullDomainData( second );
		if ( ! fullFirst || ! fullSecond ) {
			return result;
		}

		for ( const sortFunction of selectedColumnDefinition?.sortFunctions ?? [] ) {
			result = sortFunction( fullFirst, fullSecond, sortDirection === 'asc' ? 1 : -1 );
			if ( result !== 0 ) {
				break;
			}
		}
		return result;
	} );
};

export const removeColumns = ( columns: DomainsTableColumn[], ...names: string[] ) => {
	const _names = names ?? [];
	return columns.filter( ( column ) => ! _names.includes( column.name ) );
};
