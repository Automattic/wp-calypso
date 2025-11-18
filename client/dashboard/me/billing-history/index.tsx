import { userReceiptsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { DataViews, usePersistentView } from '../../app/dataviews';
import { billingHistoryRoute } from '../../app/router/me';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import {
	WIDE_FIELDS,
	DESKTOP_FIELDS,
	MOBILE_FIELDS,
	DEFAULT_VIEW,
	getFields,
	useActions,
} from './dataviews';
import type { Receipt } from '@automattic/api-core';

const emptyReceipts: Receipt[] = [];

export default function BillingHistory() {
	const { data } = useSuspenseQuery( userReceiptsQuery() );
	const receipts = data ?? emptyReceipts;

	const searchParams = billingHistoryRoute.useSearch();
	const [ defaultView, setDefaultView ] = useState( DEFAULT_VIEW );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'me-billing-history',
		defaultView,
		queryParams: searchParams,
	} );

	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView: setDefaultView,
				wideFields: WIDE_FIELDS,
				desktopFields: DESKTOP_FIELDS,
				mobileFields: MOBILE_FIELDS,
			} );
		}
	} );

	const fields = getFields( receipts );

	const { data: filteredReceipts, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( receipts, view, fields );
	}, [ receipts, view, fields ] );

	const actions = useActions();

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
						fields={ fields }
						view={ view }
						onChangeView={ updateView }
						onResetView={ resetView }
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
