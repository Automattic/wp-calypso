import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { DataViews, View } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { vatDetails as vatDetailsPath } from 'calypso/me/purchases/paths';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import { usePagination } from '../use-pagination';
import { useFieldDefinitions } from './hooks/use-field-definitions';
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

	const translate = useTranslate();
	const { vatDetails } = useVatDetails();
	const { data: geoData } = useGeoLocationQuery();
	const taxName = useTaxName( vatDetails.country ?? geoData?.country_short ?? 'GB' );

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		translate( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const editVatText = translate( 'Edit %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const addVatText = translate( 'Add %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );
	const vatText = vatDetails.id ? editVatText : addVatText;
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

	const fields = useFieldDefinitions( transactions );

	const handleViewChange = ( view: View ) => viewState.updateView( view as ViewStateUpdate );

	return (
		<DataViews
			data={ paginatedItems }
			header={
				config.isEnabled( 'me/vat-details' ) && (
					<Button className="dataviews__tax-details-notice" variant="link" href={ vatDetailsPath }>
						{ vatText }
					</Button>
				)
			}
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
