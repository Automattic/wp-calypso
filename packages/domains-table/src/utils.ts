import { DomainData, PartialDomainData } from '@automattic/data-stores';
import { I18N } from 'i18n-calypso';
import { DomainsTableColumn } from './domains-table-header/index';
import { createSiteDomainObject } from './utils/assembler';
import {
	DomainStatusPurchaseActions,
	resolveDomainStatus,
	ResolveDomainStatusReturn,
} from './utils/resolve-domain-status';

export const getSimpleSortFunctionBy =
	( column: keyof DomainData ) => ( first: DomainData, second: DomainData, sortOrder: number ) => {
		if ( ! first.hasOwnProperty( column ) || ! second.hasOwnProperty( column ) ) {
			return -1;
		}

		const firstValue = first[ column ];
		const secondValue = second[ column ];

		if (
			firstValue === secondValue ||
			typeof firstValue !== 'string' ||
			typeof secondValue !== 'string'
		) {
			return 0;
		}

		const comparison = ( firstValue ?? '' ).localeCompare( secondValue ?? '' );

		return comparison * sortOrder;
	};

export const getReverseSimpleSortFunctionBy =
	( column: keyof DomainData ) => ( first: DomainData, second: DomainData, sortOrder: number ) =>
		getSimpleSortFunctionBy( column )( first, second, sortOrder ) * -1;

export const getStatusSortFunctions = (
	translate: I18N[ 'translate' ],
	domainStatusPurchaseActions?: DomainStatusPurchaseActions
) => {
	const getStatusWeight = ( domain: DomainData ) => {
		const responseDomain = createSiteDomainObject( domain );
		const isPurchased = domainStatusPurchaseActions?.isPurchasedDomain?.( responseDomain );
		const isCreditCardExpiring =
			domainStatusPurchaseActions?.isCreditCardExpiring?.( responseDomain );
		const { listStatusWeight } =
			resolveDomainStatus( responseDomain, {
				translate,
				isPurchasedDomain: isPurchased,
				isCreditCardExpiring: isCreditCardExpiring,
				getMappingErrors: true,
			} ) ?? {};
		return listStatusWeight ?? 0;
	};

	const compareStatus = ( first: DomainData, second: DomainData, sortOrder: number ) => {
		const firstStatusWeight = getStatusWeight( first );
		const secondStatusWeight = getStatusWeight( second );
		return ( firstStatusWeight - secondStatusWeight ) * sortOrder;
	};

	return [ compareStatus, getReverseSimpleSortFunctionBy( 'domain' ) ];
};

export const shouldHideOwnerColumn = ( domains: DomainData[] ) => {
	return ! domains.some( ( domain ) => domain.owner && ! domain.current_user_is_owner );
};
export const countDomainsRequiringAttention = (
	domainStatutes: ResolveDomainStatusReturn[] | undefined
) =>
	domainStatutes?.filter( ( domainStatus ) =>
		[ 'status-neutral', 'status-alert', 'status-warning', 'status-error' ].includes(
			domainStatus.statusClass
		)
	).length;

export const sortDomains = (
	domains: PartialDomainData[] | undefined,
	domainData: Record< number, DomainData[] >,
	columns: DomainsTableColumn[] | undefined,
	sortKey: string,
	sortDirection: 'asc' | 'desc'
) => {
	const selectedColumnDefinition = ( columns || [] ).find( ( column ) => column.name === sortKey );

	const getFullDomainData = ( domain: PartialDomainData ) =>
		domainData?.[ domain.blog_id ]?.find( ( d ) => d.domain === domain.domain );

	return domains?.sort( ( first, second ) => {
		let result = 0;

		const fullFirst = getFullDomainData( first );
		const fullSecond = getFullDomainData( second );
		if ( ! fullFirst || ! fullSecond ) {
			return result;
		}

		for ( const sortFunction of selectedColumnDefinition?.sortFunctions || [] ) {
			result = sortFunction( fullFirst, fullSecond, sortDirection === 'asc' ? 1 : -1 );
			if ( result !== 0 ) {
				break;
			}
		}
		return result;
	} );
};
