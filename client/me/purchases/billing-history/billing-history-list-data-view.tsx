import { Gridicon } from '@automattic/components';
import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import { usePagination } from '../use-pagination';
import { useFieldDefinitions } from './hooks/use-field-definitions';
import { useReceiptActions } from './hooks/use-receipt-actions';
import { useTransactionsFiltering } from './hooks/use-transactions-filtering';
import { useTransactionsSorting } from './hooks/use-transactions-sorting';
import { useViewStateUpdate, updateUrlForView } from './hooks/use-view-state-update';

import 'calypso/components/dataviews/style.scss';
import './style-data-view.scss';

const DEFAULT_LAYOUT = { table: {} };

export interface BillingHistoryListProps {
	getReceiptUrlFor: ( receiptId: string ) => string;
	siteId: number | null;
}

export default function BillingHistoryListDataView( {
	getReceiptUrlFor,
	siteId,
}: BillingHistoryListProps ) {
	const transactions = useSelector( getPastBillingTransactions );
	const fields = useFieldDefinitions( transactions, getReceiptUrlFor );
	const isLoading = useSelector( isRequestingBillingTransactions );
	const viewState = useViewStateUpdate( fields );
	const receiptActions = useReceiptActions( getReceiptUrlFor );

	const actions = receiptActions.map( ( action ) => ( {
		...action,
		icon: <Gridicon icon={ action.iconName } />,
	} ) );

	const filteredTransactions = useTransactionsFiltering( transactions, viewState.view, siteId );

	const sortedTransactions = useTransactionsSorting( filteredTransactions, viewState.view );
	const { paginatedItems, totalPages, totalItems } = usePagination(
		sortedTransactions,
		viewState.view.page ?? 1,
		viewState.view.perPage ?? 100
	);
	const translate = useTranslate();

	const paginationInfo = useMemo(
		() => ( {
			totalItems,
			totalPages,
		} ),
		[ totalItems, totalPages ]
	);

	return (
		<DataViews
			data={ paginatedItems }
			paginationInfo={ paginationInfo }
			fields={ fields }
			view={ viewState.view }
			search
			searchLabel={ translate( 'Search receipts' ) }
			onChangeView={ ( newView ) => {
				updateUrlForView( newView, fields );
				viewState.updateView( newView );
			} }
			defaultLayouts={ DEFAULT_LAYOUT }
			actions={ actions }
			isLoading={ isLoading }
		/>
	);
}
