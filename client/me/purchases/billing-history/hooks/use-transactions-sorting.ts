import { useMemo } from 'react';
import { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { ViewState } from '../data-views-types';

export function useTransactionsSorting( transactions: BillingTransaction[], view: ViewState ) {
	return useMemo( () => {
		return [ ...transactions ].sort( ( a, b ) => {
			let comparison = 0;
			const sortField = view.sort.field;

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
				case 'type': {
					const aType = a.items.length > 0 ? a.items[ 0 ].type : '';
					const bType = b.items.length > 0 ? b.items[ 0 ].type : '';
					comparison = ( aType || '' ).localeCompare( bType || '' );
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
	}, [ transactions, view.sort ] );
}
