import { allSitesQuery, countryListQuery, userReceiptsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { useLocale } from '../../app/locale';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { billingHistoryRoute, purchasesRoute } from '../../app/router/me';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
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
	const { data: receipts = emptyReceipts, isLoading: isLoadingReceipts } = useQuery(
		userReceiptsQuery()
	);
	const { data: countryList = [] } = useQuery( countryListQuery() );
	const { data: sites = [], isLoading: isLoadingSites } = useQuery( allSitesQuery() );
	const isLoading = isLoadingReceipts || isLoadingSites;

	const locale = useLocale();
	const searchParams = billingHistoryRoute.useSearch();
	const [ defaultView, setDefaultView ] = useState( DEFAULT_VIEW );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'me-billing-history',
		defaultView,
		queryParams: searchParams,
		queryParamFilterFields: [ 'site' ],
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

	const fields = useMemo(
		() =>
			getFields(
				receipts,
				countryList,
				view.fields ?? WIDE_FIELDS,
				locale,
				sites,
				searchParams.site
			),
		[ receipts, countryList, view.fields, locale, sites, searchParams.site ]
	);

	const { data: filteredReceipts, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( receipts, view, fields );
	}, [ receipts, view, fields ] );

	const actions = useActions();

	const getItemId = ( receipt: Receipt ) => {
		return receipt.id.toString();
	};

	const { recordTracksEvent } = useAnalytics();
	const siteFilterValue = view.filters?.find( ( filter ) => filter.field === 'site' )?.value;
	const activeSiteId =
		Array.isArray( siteFilterValue ) && siteFilterValue.length === 1
			? Number( siteFilterValue[ 0 ] )
			: undefined;

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Billing history' ) }
					description={ __( 'View receipts and billing history for your purchases.' ) }
					actions={
						activeSiteId !== undefined && (
							<RouterLinkButton
								variant="secondary"
								to={ purchasesRoute.fullPath }
								search={ { site: activeSiteId } }
								onClick={ () =>
									recordTracksEvent(
										'calypso_dashboard_billing_history_see_purchases_for_site_click'
									)
								}
							>
								{ __( 'View active upgrades for this site' ) }
							</RouterLinkButton>
						)
					}
				/>
			}
		>
			<div ref={ ref }>
				<DataViewsCard>
					{ ! isLoading && <PerformanceTrackerStop /> }
					<DataViews
						data={ filteredReceipts }
						fields={ fields }
						view={ view }
						onChangeView={ updateView }
						onReset={ resetView }
						defaultLayouts={ { table: {} } }
						actions={ actions }
						getItemId={ getItemId }
						paginationInfo={ paginationInfo }
						isLoading={ isLoading }
					/>
				</DataViewsCard>
			</div>
		</PageLayout>
	);
}
