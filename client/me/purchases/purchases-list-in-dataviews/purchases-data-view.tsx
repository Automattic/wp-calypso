import page from '@automattic/calypso-router';
import { Gridicon, Card } from '@automattic/components';
import { Purchases, SiteDetails } from '@automattic/data-stores';
import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	DataViews,
	View,
	Filter,
	filterSortAndPaginate,
	SortDirection,
} from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { setRoute } from 'calypso/state/route/actions';
import {
	usePurchasesFieldDefinitions,
	useMembershipsFieldDefinitions,
} from './hooks/use-field-definitions';

import './style.scss';

const purchasesWideFields = [ 'site', 'product', 'status', 'payment-method' ];
const purchasesDesktopFields = [ 'site', 'product', 'status' ];
const purchasesMobileFields = [ 'product' ];
const defaultPerPage = 10;
const defaultSort = {
	field: 'site',
	direction: 'desc' as SortDirection,
};
export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'purchase-id',
	showTitle: false,
	fields: purchasesDesktopFields,
	sort: defaultSort,
	layout: {},
};

function usePreservePurchasesFiltersInUrl( {
	currentView,
	setView,
}: {
	currentView: View;
	setView: ( setter: ( currentView: View ) => View ) => void;
} ) {
	const urlSortField = 'sortField';
	const urlSortDirection = 'sortDir';
	const urlPaginationPage = 'pageNumber';
	const urlPaginationPerPage = 'perPage';
	const urlSiteFilterKey = 'siteFilter';
	const urlTypeFilterKey = 'typeFilter';
	const currentUrl = window.location.href;

	// Apply view from URL
	useEffect( () => {
		const url = new URL( currentUrl );
		const filters: Filter[] = [];
		const siteFilterValue = url.searchParams.get( urlSiteFilterKey );
		const typeFilterValue = url.searchParams.get( urlTypeFilterKey );
		const pageNumber = url.searchParams.get( urlPaginationPage );
		const perPage = url.searchParams.get( urlPaginationPerPage );
		const sortField = url.searchParams.get( urlSortField );
		const sortDir = (
			url.searchParams.get( urlSortDirection ) === 'asc' ? 'asc' : 'desc'
		) as SortDirection;
		if ( siteFilterValue ) {
			filters.push( { value: siteFilterValue, operator: 'is', field: 'site' } );
		}
		if ( typeFilterValue ) {
			filters.push( { value: typeFilterValue, operator: 'is', field: 'type' } );
		}
		setView( ( currentView ) => ( {
			...currentView,
			...( filters.length > 0 ? { filters } : {} ),
			...( pageNumber ? { page: parseInt( pageNumber ) } : {} ),
			...( perPage ? { perPage: parseInt( perPage ) } : {} ),
			...( sortField ? { sort: { field: sortField, direction: sortDir } } : {} ),
		} ) );
	}, [ setView, currentUrl ] );

	// Apply URL from view
	useEffect( () => {
		const url = new URL( window.location.href );
		const siteFilter = currentView.filters?.find( ( filter ) => filter.field === 'site' );
		if ( siteFilter ) {
			url.searchParams.set( urlSiteFilterKey, siteFilter.value );
		} else {
			url.searchParams.delete( urlSiteFilterKey );
		}

		const typeFilter = currentView.filters?.find( ( filter ) => filter.field === 'type' );
		if ( typeFilter ) {
			url.searchParams.set( urlTypeFilterKey, typeFilter.value );
		} else {
			url.searchParams.delete( urlTypeFilterKey );
		}

		const pageNumber = currentView.page;
		if ( pageNumber && pageNumber > 1 ) {
			url.searchParams.set( urlPaginationPage, String( pageNumber ) );
		} else {
			url.searchParams.delete( urlPaginationPage );
		}

		const perPage = currentView.perPage;
		if ( perPage && perPage !== defaultPerPage ) {
			url.searchParams.set( urlPaginationPerPage, String( perPage ) );
		} else {
			url.searchParams.delete( urlPaginationPerPage );
		}

		const sort = currentView.sort;
		if ( sort && sort !== defaultSort ) {
			url.searchParams.set( urlSortField, sort.field );
			url.searchParams.set( urlSortDirection, sort.direction );
		} else {
			url.searchParams.delete( urlSortField );
			url.searchParams.delete( urlSortDirection );
		}

		if ( url.search === window.location.search ) {
			return;
		}
		window.history.pushState( undefined, '', url );
		// getPreviousRoute will not find this updated route unless we set it
		// explicitly. It only records the route when the page first loads.
		// This seems like a bug but it appears to be how it works.
		reduxDispatch( setRoute( window.location.pathname, Object.fromEntries( url.searchParams ) ) );
	}, [ currentView ] );
}

export function PurchasesDataViews( {
	purchases,
	sites,
}: {
	purchases: Purchases.Purchase[];
	sites: SiteDetails[];
} ) {
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const translate = useTranslate();
	const [ currentView, setView ] = useState( purchasesDataView );

	// Hide fields at mobile width
	useEffect( () => {
		if ( isWide && currentView.fields !== purchasesWideFields ) {
			setView( { ...currentView, fields: purchasesWideFields } );
		}
		if ( isWide ) {
			return;
		}
		if ( isDesktop && currentView.fields !== purchasesDesktopFields ) {
			setView( { ...currentView, fields: purchasesDesktopFields } );
		}
		if ( isDesktop ) {
			return;
		}
		if ( currentView.fields !== purchasesMobileFields ) {
			setView( { ...currentView, fields: purchasesMobileFields } );
		}
	}, [ isWide, isDesktop, currentView, setView ] );

	// Keep track of the current view params in the URL and restore them when the page loads.
	usePreservePurchasesFiltersInUrl( { currentView, setView } );

	const sitesWithPurchases = useMemo( () => {
		return Array.from(
			purchases.reduce( ( collected, purchase ) => {
				const siteForPurchase = sites.find( ( site ) => site.ID === purchase.siteId );
				if ( siteForPurchase ) {
					collected.add( siteForPurchase );
				}
				return collected;
			}, new Set< SiteDetails >() )
		);
	}, [ sites, purchases ] );

	const purchasesDataFields = usePurchasesFieldDefinitions( {
		sites: sitesWithPurchases,
	} );
	const { data: adjustedPurchases, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( purchases, currentView, purchasesDataFields );
	}, [ purchases, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: translate( 'Manage purchase', { textOnly: true } ),
				isEligible: ( item: Purchases.Purchase ) => Boolean( item.domain && item.id ),
				callback: ( items: Purchases.Purchase[] ) => {
					const siteUrl = items[ 0 ].domain;
					const subscriptionId = items[ 0 ].id;
					if ( ! siteUrl ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without site' );
						return;
					}
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					page( `/me/purchases/${ siteUrl }/${ subscriptionId }` );
				},
			},
		],
		[ translate ]
	);

	const getItemId = ( item: Purchases.Purchase ) => {
		return item.id.toString();
	};
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ adjustedPurchases }
				fields={ purchasesDataFields }
				view={ currentView }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
				actions={ actions }
				getItemId={ getItemId }
				paginationInfo={ paginationInfo }
			/>
		</Card>
	);
}

const membershipsDesktopFields = [ 'site', 'product', 'status' ];
const membershipsMobileFields = [ 'product' ];
export const membershipDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'purchase-id',
	showTitle: false,
	fields: membershipsDesktopFields,
	sort: {
		field: 'product',
		direction: 'desc',
	},
	layout: {},
};

export function MembershipsDataViews( { memberships }: { memberships: MembershipSubscription[] } ) {
	const membershipsDataFields = useMembershipsFieldDefinitions();
	const [ currentView, setView ] = useState( membershipDataView );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const translate = useTranslate();

	// Hide fields at mobile width
	useEffect( () => {
		if ( isDesktop && currentView.fields === membershipsMobileFields ) {
			setView( { ...currentView, fields: membershipsDesktopFields } );
			return;
		}
		if ( ! isDesktop && currentView.fields === membershipsDesktopFields ) {
			setView( { ...currentView, fields: membershipsMobileFields } );
			return;
		}
	}, [ isDesktop, currentView, setView ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: translate( 'Manage this purchase', { textOnly: true } ),
				isPrimary: true,
				icon: <Gridicon icon="chevron-right" />,
				isEligible: ( item: MembershipSubscription ) => Boolean( item.ID ),
				callback: ( items: MembershipSubscription[] ) => {
					const subscriptionId = items[ 0 ].ID;
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					page( `/me/purchases/other/${ subscriptionId }` );
				},
			},
		],
		[ translate ]
	);

	const { data: adjustedMemberships, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( memberships, currentView, membershipsDataFields );
	}, [ memberships, currentView, membershipsDataFields ] );

	const getItemId = ( item: MembershipSubscription ) => {
		return item.ID;
	};
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ adjustedMemberships }
				fields={ membershipsDataFields }
				view={ currentView }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
				actions={ actions }
				getItemId={ getItemId }
				paginationInfo={ paginationInfo }
			/>
		</Card>
	);
}
