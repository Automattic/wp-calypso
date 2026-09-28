import { allSitesQuery, countryListQuery, userReceiptsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { useIntlLocale } from '../../app/locale';
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
	filterSortAndPaginateReceipts,
	getFields,
	useActions,
} from './dataviews';
import type { Receipt } from '@automattic/api-core';

const emptyReceipts: Receipt[] = [];

export default function BillingHistory() {
	const { supports } = useAppContext();
	// Hosts without a `me` section embed these screens already scoped to a site,
	// so the site filter is theirs to set rather than the visitor's.
	const supportsMe = Boolean( supports.me );
	const { data: receipts = emptyReceipts, isLoading: isLoadingReceipts } =
		useQuery( userReceiptsQuery() );
	const { data: countryList = [] } = useQuery( countryListQuery() );
	const { data: sites = [], isLoading: isLoadingSites } = useQuery( allSitesQuery() );
	const isLoading = isLoadingReceipts || isLoadingSites;

	const locale = useIntlLocale();
	const searchParams = billingHistoryRoute.useSearch();
	const [ defaultView, setDefaultView ] = useState( DEFAULT_VIEW );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'me-billing-history',
		defaultView,
		queryParams: searchParams,
		queryParamFilterFields: [ 'site' ],
		lockQueryParamFilters: ! supportsMe,
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
				searchParams.site,
				supportsMe
			),
		[ receipts, countryList, view.fields, locale, sites, searchParams.site, supportsMe ]
	);

	const { data: filteredReceipts, paginationInfo } = useMemo( () => {
		return filterSortAndPaginateReceipts( receipts, view, fields );
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
						supportsMe &&
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
