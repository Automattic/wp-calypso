/* eslint-disable prettier/prettier */
import pageRedirect from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DataViews, Operator } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { isEqual } from 'lodash';
import moment from 'moment';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { capitalPDangit } from 'calypso/lib/formatting';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';
import type { IAppState } from 'calypso/state/types';
import type { Action } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import 'calypso/components/dataviews/style.scss';
import './style.scss';

const INITIAL_PAGE = 1;
const ITEMS_PER_PAGE = 10;

type SortableField = 'date' | 'service' | 'type' | 'amount';

const SORT_DEFAULTS = {
	FIELD: 'date' as SortableField,
	DIRECTION: 'desc',
} as const;

const TABLE_DEFAULTS = {
	TYPE: 'table',
	FIELDS: [ 'date', 'service', 'type', 'amount' ] as string[],
} as const;

type ViewType = 'table';
type SortDirection = 'asc' | 'desc';

interface ViewStateUpdate {
	page?: number;
	perPage?: number;
	sort?: {
		field: string;
		direction: SortDirection;
	};
	filters?: Array< {
		field: string;
		operator: Operator;
		value: string | string[];
	} >;
	search?: string;
	fields?: string[];
}

interface ViewState {
	type: ViewType;
	search: string;
	filters: Array< {
		field: string;
		operator: Operator;
		value: string | string[];
	} >;
	page: number;
	perPage: number;
	sort: {
		field: SortableField;
		direction: SortDirection;
	};
	fields: string[];
	hiddenFields: string[];
}

const DATE_FORMATS = {
	MONTH_YEAR: 'YYYY-MM',
	MONTH_YEAR_LABEL: 'MMMM YYYY',
	DISPLAY: 'll',
} as const;

const TRANSACTION_TYPES = {
	NEW_PURCHASE: { value: 'new purchase', label: 'New Purchase' },
	RENEWAL: { value: 'recurring', label: 'Renewal' },
} as const;

const recordClickEvent = ( eventAction: string ) => {
	recordGoogleEvent( 'Me', eventAction );
};

const getUniqueMonths = (
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > => {
	const uniqueMonths = new Set(
		transactions.map( ( transaction ) =>
			moment( transaction.date ).format( DATE_FORMATS.MONTH_YEAR )
		)
	);

	return Array.from( uniqueMonths )
		.sort()
		.reverse()
		.map( ( monthStr ) => ( {
			value: monthStr,
			label: moment( monthStr ).format( DATE_FORMATS.MONTH_YEAR_LABEL ),
		} ) );
};

const getUniqueServices = (
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > => {
	const uniqueServices = new Set( transactions.map( ( transaction ) => transaction.service ) );

	return Array.from( uniqueServices )
		.sort()
		.map( ( service ) => ( {
			value: service,
			label: service,
		} ) );
};

const serviceNameDescription = (
	transaction: BillingTransactionItem,
	translate: ReturnType< typeof useTranslate >
) => {
	const plan = capitalPDangit( transaction.variation );
	const termLabel = getTransactionTermLabel( transaction, translate );
	return (
		<div>
			<strong>{ plan }</strong>
			{ transaction.domain && <small>{ transaction.domain }</small> }
			{ termLabel && <small>{ termLabel }</small> }
			{ transaction.licensed_quantity && (
				<small>{ renderTransactionQuantitySummary( transaction, translate ) }</small>
			) }
		</div>
	);
};

const serviceName = (
	transaction: BillingTransaction,
	translate: ReturnType< typeof useTranslate >
) => {
	const [ transactionItem, ...moreTransactionItems ] = groupDomainProducts(
		transaction.items,
		translate
	);

	if ( moreTransactionItems.length > 0 ) {
		return <strong>{ translate( 'Multiple items' ) }</strong>;
	}

	if ( transactionItem.product === transactionItem.variation ) {
		return transactionItem.product;
	}

	return serviceNameDescription( transactionItem, translate );
};

export interface BillingHistoryListProps {
	getReceiptUrlFor: ( receiptId: string ) => string;
}

interface WithMoment {
	moment: typeof moment;
}

const usePagination = ( items: BillingTransaction[], page: number, perPage: number ) => {
	return useMemo( () => {
		const startIndex = ( page - 1 ) * perPage;
		return {
			paginatedItems: items.slice( startIndex, startIndex + perPage ),
			totalPages: Math.ceil( items.length / perPage ),
			totalItems: items.length,
		};
	}, [ items, page, perPage ] );
};

const BillingHistoryListDataView: React.FC< BillingHistoryListProps & WithMoment > = ( {
	getReceiptUrlFor,
	moment,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< IAppState, undefined, Action > >();
	const transactions = useSelector( getPastBillingTransactions );

	const [ view, setView ] = useState< ViewState >( {
		type: TABLE_DEFAULTS.TYPE,
		search: '',
		filters: [],
		page: INITIAL_PAGE,
		perPage: ITEMS_PER_PAGE,
		sort: {
			field: SORT_DEFAULTS.FIELD,
			direction: SORT_DEFAULTS.DIRECTION,
		},
		fields: [ ...TABLE_DEFAULTS.FIELDS ],
		hiddenFields: [],
	} );

	const filteredTransactions = ( transactions ?? [] ).filter( ( transaction ) => {
		if ( view.search ) {
			const searchTerm = view.search.toLowerCase();
			const [ transactionItem ] = groupDomainProducts( transaction.items, translate );
			const searchableFields = [
				transaction.service,
				transactionItem.product,
				transactionItem.variation,
				transactionItem.domain,
				moment( transaction.date ).format( DATE_FORMATS.DISPLAY ),
				transaction.amount,
			];

			if (
				! searchableFields.some(
					( field ) => field && field.toString().toLowerCase().includes( searchTerm )
				)
			) {
				return false;
			}
		}

		if ( view.filters.length === 0 ) {
			return true;
		}

		return view.filters.every( ( filter ) => {
			if ( filter.field === 'service' && filter.value ) {
				return transaction.service === filter.value;
			}
			if ( filter.field === 'type' && filter.value ) {
				const [ firstItem ] = groupDomainProducts( transaction.items, translate );
				return firstItem.type === filter.value;
			}
			if ( filter.field === 'date' && filter.value ) {
				return moment( transaction.date ).format( DATE_FORMATS.MONTH_YEAR ) === filter.value;
			}
			return true;
		} );
	} );

	const sortedTransactions = [ ...filteredTransactions ].sort( ( a, b ) => {
		let comparison = 0;
		const sortField = view.sort.field as SortableField;

		switch ( sortField ) {
			case 'date':
				comparison = new Date( a.date ).getTime() - new Date( b.date ).getTime();
				break;
			case 'service': {
				const aService = a.items.length > 0 ? a.items[ 0 ].variation : a.service;
				const bService = b.items.length > 0 ? b.items[ 0 ].variation : b.service;
				comparison = ( aService || '' ).localeCompare( bService || '' );
				break;
			}
			case 'amount':
				comparison = a.amount_integer - b.amount_integer;
				break;
			default:
				return 0;
		}
		return view.sort.direction === 'desc' ? -comparison : comparison;
	} );

	const { paginatedItems, totalPages, totalItems } = usePagination(
		sortedTransactions,
		view.page,
		view.perPage
	);

	const onChangeView = ( newView: ViewStateUpdate ) => {
		setView( ( currentView ) => {
			const updatedView = { ...currentView };

			if ( newView.page !== undefined && newView.page !== currentView.page ) {
				updatedView.page = newView.page;
			}

			if ( newView.perPage && newView.perPage !== currentView.perPage ) {
				updatedView.perPage = newView.perPage;
				updatedView.page = 1;
			}

			if ( newView.sort && ! isEqual( newView.sort, currentView.sort ) ) {
				updatedView.sort = {
					field: newView.sort.field as SortableField,
					direction: newView.sort.direction,
				};
			}

			if ( newView.filters && ! isEqual( newView.filters, currentView.filters ) ) {
				updatedView.filters = newView.filters;
				updatedView.page = 1;
			}

			if ( newView.search !== undefined ) {
				updatedView.search = newView.search;
			}

			if ( newView.fields !== undefined ) {
				updatedView.fields = newView.fields;
			}

			return updatedView;
		} );
	};

	const fields = useMemo( () => {
		const fieldDefinitions = {
			date: {
				id: 'date',
				label: 'Date',
				type: 'text' as const,
				elements: getUniqueMonths( transactions ?? [] ),
				enableGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				isHidden: view.hiddenFields.includes( 'date' ),
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				getValue: ( { item }: { item: BillingTransaction } ) => {
					return moment( item.date ).format( DATE_FORMATS.MONTH_YEAR );
				},
				render: ( { item }: { item: BillingTransaction } ) => {
					return <time>{ moment( item.date ).format( DATE_FORMATS.DISPLAY ) }</time>;
				},
			},
			service: {
				id: 'service',
				label: 'App',
				type: 'text' as const,
				elements: getUniqueServices( transactions ?? [] ),
				enableGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				isHidden: view.hiddenFields.includes( 'service' ),
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				render: ( { item }: { item: BillingTransaction } ) => {
					return <div>{ serviceName( item, translate ) }</div>;
				},
				getValue: ( { item }: { item: BillingTransaction } ) => {
					const [ transactionItem ] = groupDomainProducts( item.items, translate );
					if ( transactionItem.product === transactionItem.variation ) {
						return transactionItem.product;
					}
					return capitalPDangit( transactionItem.variation );
				},
			},
			type: {
				id: 'type',
				label: 'Type',
				type: 'text' as const,
				elements: [ TRANSACTION_TYPES.NEW_PURCHASE, TRANSACTION_TYPES.RENEWAL ],
				enableGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				isHidden: view.hiddenFields.includes( 'type' ),
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				render: ( { item }: { item: BillingTransaction } ) => {
					const [ transactionItem ] = groupDomainProducts( item.items, translate );
					return (
						<div>{ transactionItem.type_localized || capitalPDangit( transactionItem.type ) }</div>
					);
				},
				getValue: ( { item }: { item: BillingTransaction } ) => {
					const [ transactionItem ] = groupDomainProducts( item.items, translate );
					return transactionItem.type;
				},
			},
			amount: {
				id: 'amount',
				label: 'Amount',
				type: 'text' as const,
				enableGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				isHidden: view.hiddenFields.includes( 'amount' ),
				getValue: ( { item }: { item: BillingTransaction } ) => {
					return item.amount_integer;
				},
				render: ( { item }: { item: BillingTransaction } ) => {
					return <TransactionAmount transaction={ item } />;
				},
			},
		};

		return view.fields.map(
			( fieldId ) => fieldDefinitions[ fieldId as keyof typeof fieldDefinitions ]
		);
	}, [ transactions, view.hiddenFields, view.fields, translate, moment ] );

	const actions = useMemo(
		() => [
			{
				id: 'view-receipt',
				label: 'View receipt',
				isPrimary: true,
				icon: <Gridicon icon="pages" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					pageRedirect.redirect( getReceiptUrlFor( item.id ) );
				},
			},
			{
				id: 'email-receipt',
				label: 'Email receipt',
				isPrimary: true,
				icon: <Gridicon icon="mail" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					recordClickEvent( 'Email Receipt in Billing History' );
					dispatch( sendBillingReceiptEmail( item.id ) );
				},
			},
		],
		[ dispatch, getReceiptUrlFor ]
	);

	return (
		<div className="billing-history">
			<div className="dataviews-wrapper">
				<DataViews
					data={ paginatedItems }
					paginationInfo={ {
						totalItems,
						totalPages,
					} }
					fields={ fields }
					view={ view }
					search
					searchLabel="Search receipts"
					onChangeView={ onChangeView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					isLoading={ false }
				/>
			</div>
		</div>
	);
};

export default withLocalizedMoment( BillingHistoryListDataView );
