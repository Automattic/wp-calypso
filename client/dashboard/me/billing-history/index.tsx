import { countryListQuery, sitesQuery, userReceiptsQuery } from '@automattic/api-queries';
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
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
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

function getEmptyResults( hasSearch: boolean, hasOwnFilters: boolean ) {
	if ( hasSearch ) {
		return (
			<DataViewsEmptyStateLayout
				isBorderless
				title={ __( 'No receipts match your search' ) }
				description={ __( 'Try a different search term.' ) }
			/>
		);
	}
	if ( hasOwnFilters ) {
		return (
			<DataViewsEmptyStateLayout
				isBorderless
				title={ __( 'No receipts match your filters' ) }
				description={ __( 'Try different filters, or reset them.' ) }
			/>
		);
	}
	// Neither narrowed the list, so the request failed: keep the default message.
	return undefined;
}

export default function BillingHistory() {
	const { supports } = useAppContext();
	// Hosts without a `me` section embed these screens already scoped to a site,
	// so the site filter is theirs to set rather than the visitor's.
	const supportsMe = Boolean( supports.me );
	const {
		data: receipts = emptyReceipts,
		isLoading: isLoadingReceipts,
		isSuccess: hasLoadedReceipts,
	} = useQuery( userReceiptsQuery() );
	const { data: countryList = [] } = useQuery( countryListQuery() );
	const { data: sites = [], isLoading: isLoadingSites } = useQuery( sitesQuery() );
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

	// A locked filter is set by the surrounding page, so it is part of what the
	// list is, not of what the user narrowed it down to.
	const lockedFilters = useMemo(
		() => view.filters?.filter( ( filter ) => filter.isLocked ) ?? [],
		[ view.filters ]
	);
	const isSiteLocked = lockedFilters.length > 0;
	const hasOwnFilters = ( view.filters?.length ?? 0 ) > lockedFilters.length;
	const hasReceipts = useMemo( () => {
		if ( ! isSiteLocked ) {
			return receipts.length > 0;
		}
		const { data } = filterSortAndPaginateReceipts(
			receipts,
			{ ...view, search: '', filters: lockedFilters, page: 1 },
			fields
		);
		return data.length > 0;
	}, [ receipts, isSiteLocked, lockedFilters, view, fields ] );
	// Only a successful response can tell that there is nothing to list.
	const isEmpty = ! isLoading && hasLoadedReceipts && ! hasReceipts;

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
				{ ! isLoading && <PerformanceTrackerStop /> }
				{ isEmpty ? (
					<DataViewsEmptyStateLayout
						title={ supportsMe ? __( 'No receipts yet' ) : __( 'No receipts for this site' ) }
						description={
							supportsMe
								? __( 'Receipts will appear here after your first purchase.' )
								: __( 'Receipts for purchases on this site will appear here.' )
						}
					/>
				) : (
					<DataViewsCard>
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
							empty={ getEmptyResults( Boolean( view.search ), hasOwnFilters ) }
						/>
					</DataViewsCard>
				) }
			</div>
		</PageLayout>
	);
}
