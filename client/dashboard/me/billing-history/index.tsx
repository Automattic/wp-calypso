import { billingTransactionsQuery, queryClient } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, createInterpolateElement } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import { getFieldDefinitions } from './field-definitions';
import type { View } from '@wordpress/dataviews';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import './style.scss';

const billingHistoryWideFields = [ 'date', 'type', 'amount' ];
const billingHistoryDesktopFields = [ 'date', 'type' ];
const billingHistoryMobileFields: string[] = [ 'date' ];

const defaultBillingHistoryView: View = {
	type: 'table',
	page: 1,
	search: '',
	perPage: 20,
	titleField: 'service',
	showTitle: true,
	mediaField: 'date',
	showMedia: false,
	descriptionField: 'type',
	showDescription: true,
	fields: billingHistoryDesktopFields,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	layout: {},
};

function getReceiptUrlFor( receiptId: string ): string {
	return `/me/purchases/billing/receipt/${ receiptId }`;
}

export default function BillingHistory() {
	const { data: transactions } = useSuspenseQuery( billingTransactionsQuery() );
	const [ currentView, setView ] = useState( defaultBillingHistoryView );

	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView,
				wideFields: billingHistoryWideFields,
				desktopFields: billingHistoryDesktopFields,
				mobileFields: billingHistoryMobileFields,
			} );
		}
	} );

	const billingFields = getFieldDefinitions( transactions ?? [], getReceiptUrlFor );

	const { data: filteredTransactions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( transactions ?? [], currentView, billingFields );
	}, [ transactions, currentView, billingFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'view-receipt',
				label: __( 'View receipt' ),
				isEligible: ( item: BillingTransaction ) => Boolean( item.id ),
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					window.open( getReceiptUrlFor( item.id ), '_blank' );
				},
			},
		],
		[]
	);

	const onChangeView = ( newView: View ) => {
		setView( newView );
	};

	const getItemId = ( transaction: BillingTransaction ) => {
		return transaction.id.toString();
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Billing history' ) } />
			}
		>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						data={ filteredTransactions ?? [] }
						fields={ billingFields }
						view={ currentView }
						onChangeView={ onChangeView }
						defaultLayouts={ { table: {} } }
						actions={ actions }
						getItemId={ getItemId }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</div>
		</PageLayout>
	);
}
