import { Gridicon } from '@automattic/components';
import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import { useFieldDefinitions } from './hooks/use-field-definitions';
import { usePagination } from './hooks/use-pagination';
import { useReceiptActions } from './hooks/use-receipt-actions';
import { useTransactionsFiltering } from './hooks/use-transactions-filtering';
import { useTransactionsSorting } from './hooks/use-transactions-sorting';
import { useViewStateUpdate } from './hooks/use-view-state-update';

import 'calypso/components/dataviews/style.scss';
import './style-data-view.scss';

export interface BillingHistoryListProps {
	getReceiptUrlFor: ( receiptId: string ) => string;
}

const BillingHistoryListDataView: React.FC< BillingHistoryListProps > = ( {
	getReceiptUrlFor,
} ) => {
	const transactions = useSelector( getPastBillingTransactions );
	const isLoading = useSelector( isRequestingBillingTransactions );
	const viewState = useViewStateUpdate();
	const receiptActions = useReceiptActions( getReceiptUrlFor );

	const actions = receiptActions.map( ( action ) => ( {
		...action,
		icon: <Gridicon icon={ action.iconName } />,
	} ) );

	const filteredTransactions = useTransactionsFiltering( transactions, viewState.view );
	const sortedTransactions = useTransactionsSorting( filteredTransactions, viewState.view );
	const { paginatedItems, totalPages, totalItems } = usePagination(
		sortedTransactions,
		viewState.view.page,
		viewState.view.perPage
	);
	const translate = useTranslate();
	const fields = useFieldDefinitions( transactions, translate );

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
					view={ viewState.view }
					search
					searchLabel={ translate( 'Search receipts' ) }
					onChangeView={ viewState.updateView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					isLoading={ isLoading }
				/>
			</div>
		</div>
	);
};

export default withLocalizedMoment( BillingHistoryListDataView );
