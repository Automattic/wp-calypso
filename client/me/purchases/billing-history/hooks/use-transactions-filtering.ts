import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { BillingTransaction } from 'calypso/state/billing-transactions/types';
import { DATE_FORMATS } from '../constants';
import { groupDomainProducts } from '../utils';
import type { ViewState, Filter } from '../data-views-types';

export function useTransactionsFiltering(
	transactions: BillingTransaction[] | null,
	view: ViewState
) {
	const translate = useTranslate();

	return useMemo( () => {
		return ( transactions ?? [] ).filter( ( transaction ) => {
			if ( view.search ) {
				const searchTerm = view.search.toLowerCase();
				const [ transactionItem ] = groupDomainProducts( transaction.items, translate );
				const searchableFields = [
					transaction.service,
					transaction.amount_integer,
					transactionItem.product,
					transactionItem.variation,
					transactionItem.domain,
					moment( transaction.date ).format( DATE_FORMATS.DISPLAY ),
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

			return view.filters.every( ( filter: Filter ) => {
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
	}, [ transactions, view.search, view.filters, translate ] );
}
