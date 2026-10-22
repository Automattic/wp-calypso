import {
	userPaymentMethodsQuery,
	userPurchasesQuery,
	allSitesQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import {
	billingHistoryRoute,
	monetizeSubscriptionsRoute,
	purchasesIndexRoute,
	purchasesRoute,
} from '../../app/router/me';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import { useIsSplitCancelRemoveEnabled } from './cancel-purchase/use-is-split-cancel-remove-enabled';
import {
	WIDE_FIELDS,
	DESKTOP_FIELDS,
	MOBILE_FIELDS,
	DEFAULT_VIEW,
	getFields,
	getItemId,
	usePurchasesListActions,
} from './dataviews';
import { PurchaseRemovedNotice } from './purchase-removed-notice';
import { useOtherUsersSitePurchases } from './use-other-users-site-purchases';

export default function PurchasesList() {
	const { supports } = useAppContext();
	// Hosts without a `me` section embed these screens already scoped to a site,
	// so the site filter is theirs to set rather than the visitor's.
	const supportsMe = Boolean( supports.me );
	const supportsMonetizeSubscriptions = Boolean(
		supports.me && supports.me.billing && supports.me.billing.monetizeSubscriptions
	);
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	const currentSearchParams = purchasesRoute.useSearch();
	const { removed, removedDomain, removedId } = purchasesIndexRoute.useSearch();
	// Capture notice data on first render — useSearch() may lose the values
	// after replaceState strips the URL params.
	const [ removedNoticeData ] = useState( () =>
		removed
			? { productNoun: removed, atomicDomain: removedDomain, purchaseId: removedId ?? null }
			: null
	);
	const [ showRemovedNotice, setShowRemovedNotice ] = useState( Boolean( removedNoticeData ) );

	useEffect( () => {
		if ( removed ) {
			// Strip notice params from the URL without triggering a TanStack Router
			// re-navigation — avoids a route loader re-run and layout shift.
			const url = new URL( window.location.href );
			url.searchParams.delete( 'removed' );
			url.searchParams.delete( 'removedDomain' );
			url.searchParams.delete( 'removedId' );
			window.history.replaceState( window.history.state, '', url.toString() );
		}
	}, [ removed ] );

	const { data: purchases = [], isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases = [], isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites = [], isLoading: isLoadingSites } = useQuery( allSitesQuery() );

	// Dismiss the success notice when the background mutation rolls back —
	// detected by the captured purchase reappearing in the userPurchasesQuery
	// cache. The cancel page's 15s cache guard re-strips transient stale
	// refetches synchronously inside the QueryCache notify callback, so this
	// effect never observes transient success-path reappearances.
	useEffect( () => {
		if ( ! removedNoticeData?.purchaseId ) {
			return;
		}
		if ( purchases.some( ( p ) => p.ID === removedNoticeData.purchaseId ) ) {
			setShowRemovedNotice( false );
		}
	}, [ purchases, removedNoticeData ] );

	const [ defaultView, setDefaultView ] = useState( DEFAULT_VIEW );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'me-billing-purchases',
		defaultView,
		queryParams: currentSearchParams,
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

	const siteFilterValue = view.filters?.find( ( filter ) => filter.field === 'site' )?.value;
	const siteFilterIds = useMemo(
		() => ( Array.isArray( siteFilterValue ) ? siteFilterValue.map( Number ) : [] ),
		[ siteFilterValue ]
	);
	const { purchases: otherUsersPurchases, isLoading: isLoadingOtherUsersPurchases } =
		useOtherUsersSitePurchases( { siteIds: siteFilterIds, sites } );

	const isLoading =
		isLoadingPurchases ||
		isLoadingTransferredPurchases ||
		isLoadingSites ||
		isLoadingOtherUsersPurchases;

	const { data: paymentMethods = [] } = useQuery( userPaymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites,
		paymentMethods,
		transferredPurchases,
		siteFilter: currentSearchParams.site,
		visibleFields: view.fields,
		canFilterBySite: supportsMe,
	} );

	// A transferred purchase can also be another user's purchase on a filtered site.
	const extraOtherUsersPurchases = useMemo( () => {
		const knownIds = new Set( transferredPurchases.map( ( purchase ) => purchase.ID ) );
		return otherUsersPurchases.filter( ( purchase ) => ! knownIds.has( purchase.ID ) );
	}, [ otherUsersPurchases, transferredPurchases ] );

	const allSubscriptions = useMemo( () => {
		return isLoading ? [] : [ ...purchases, ...transferredPurchases, ...extraOtherUsersPurchases ];
	}, [ isLoading, purchases, transferredPurchases, extraOtherUsersPurchases ] );

	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( allSubscriptions, view, purchasesDataFields );
	}, [ allSubscriptions, view, purchasesDataFields ] );

	const actions = usePurchasesListActions( {
		transferredPurchases,
	} );

	const { recordTracksEvent } = useAnalytics();
	const activeSiteId = siteFilterIds.length === 1 ? siteFilterIds[ 0 ] : undefined;

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Active upgrades' ) }
					description={
						supportsMonetizeSubscriptions
							? createInterpolateElement(
									__(
										'View and manage your active plans and purchases. Purchases from other WordPress.com sites are in <link>Memberships & donations</link>.'
									),
									{
										link: <RouterLinkButton variant="link" to={ monetizeSubscriptionsRoute.to } />,
									}
								)
							: __( 'View and manage your active plans and purchases.' )
					}
					actions={
						supportsMe &&
						activeSiteId !== undefined && (
							<RouterLinkButton
								variant="secondary"
								to={ billingHistoryRoute.fullPath }
								search={ { site: activeSiteId } }
								onClick={ () =>
									recordTracksEvent(
										'calypso_dashboard_purchases_see_billing_history_for_site_click'
									)
								}
							>
								{ __( 'View billing history for this site' ) }
							</RouterLinkButton>
						)
					}
				/>
			}
		>
			{ isSplitCancelRemoveEnabled && showRemovedNotice && (
				<PurchaseRemovedNotice
					productNoun={ removedNoticeData?.productNoun ?? '' }
					atomicDomain={ removedNoticeData?.atomicDomain }
					onClose={ () => setShowRemovedNotice( false ) }
				/>
			) }
			{ ! isLoading && extraOtherUsersPurchases.length > 0 && (
				<Notice>
					{ siteFilterIds.length === 1
						? sprintf(
								/* translators: %s is the number of subscriptions. */
								_n(
									'Includes %s subscription on this site purchased by another user.',
									'Includes %s subscriptions on this site purchased by other users.',
									extraOtherUsersPurchases.length
								),
								formatNumber( extraOtherUsersPurchases.length )
							)
						: sprintf(
								/* translators: %s is the number of subscriptions. */
								_n(
									'Includes %s subscription on these sites purchased by another user.',
									'Includes %s subscriptions on these sites purchased by other users.',
									extraOtherUsersPurchases.length
								),
								formatNumber( extraOtherUsersPurchases.length )
							) }
				</Notice>
			) }
			<div ref={ ref }>
				<DataViewsCard className="purchases-list__wrapper">
					{ ! isLoading && <PerformanceTrackerStop /> }
					<DataViews
						isLoading={ isLoading }
						data={ filteredSubscriptions }
						fields={ purchasesDataFields }
						view={ view }
						onChangeView={ updateView }
						onReset={ resetView }
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
