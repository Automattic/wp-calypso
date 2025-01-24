import { Gridicon } from '@automattic/components';
import { DataViews, View } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import { useFieldDefinitions } from './hooks/use-field-definitions';
import { usePagination } from './hooks/use-pagination';
import { useReceiptActions } from './hooks/use-receipt-actions';
import { useTransactionsFiltering } from './hooks/use-transactions-filtering';
import { useTransactionsSorting } from './hooks/use-transactions-sorting';
import { useViewStateUpdate } from './hooks/use-view-state-update';
import type { ViewStateUpdate } from './data-views-types';

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
	const isLoading = useSelector( isRequestingBillingTransactions );
	const viewState = useViewStateUpdate();
	const receiptActions = useReceiptActions( getReceiptUrlFor );

	const actions = receiptActions.map( ( action ) => ( {
		...action,
		icon: <Gridicon icon={ action.iconName } />,
	} ) );

	const filteredTransactions = useTransactionsFiltering( transactions, viewState.view, siteId );

	const sortedTransactions = useTransactionsSorting( filteredTransactions, viewState.view );
	const { paginatedItems, totalPages, totalItems } = usePagination(
		sortedTransactions,
		viewState.view.page,
		viewState.view.perPage
	);
	const translate = useTranslate();
	const fields = useFieldDefinitions( transactions );

	const handleViewChange = ( view: View ) => viewState.updateView( view as ViewStateUpdate );

	return (
		<DataViews
			data={ paginatedItems }
			paginationInfo={ {
				totalItems,
				totalPages,
			} }
			fields={ fields }
			view={ viewState.view }
			search
			searchLabel={ translate( 'Search receipts' ) }
			onChangeView={ handleViewChange }
			defaultLayouts={ DEFAULT_LAYOUT }
			actions={ actions }
			isLoading={ isLoading }
		/>
	);
}
