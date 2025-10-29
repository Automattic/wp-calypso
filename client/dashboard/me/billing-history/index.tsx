import { userReceiptsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import {
	billingHistoryWideFields,
	billingHistoryDesktopFields,
	billingHistoryMobileFields,
	defaultBillingHistoryView,
	getFieldDefinitions,
	useBillingHistoryActions,
} from './dataviews';
import type { Receipt } from '@automattic/api-core';

const emptyReceipts: Receipt[] = [];

export default function BillingHistory() {
	const { data } = useSuspenseQuery( userReceiptsQuery() );
	const receipts = data ?? emptyReceipts;

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

	const billingFields = getFieldDefinitions( receipts );

	const { data: filteredReceipts, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( receipts, currentView, billingFields );
	}, [ receipts, currentView, billingFields ] );

	const actions = useBillingHistoryActions();

	const getItemId = ( receipt: Receipt ) => {
		return receipt.id.toString();
	};

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Billing history' ) } />
			}
		>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						data={ filteredReceipts }
						fields={ billingFields }
						view={ currentView }
						onChangeView={ setView }
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
