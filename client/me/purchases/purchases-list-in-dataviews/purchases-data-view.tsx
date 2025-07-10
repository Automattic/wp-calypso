import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
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
import { isTransferredOwnership } from '../hooks/use-is-transferred-ownership';
import {
	usePurchasesFieldDefinitions,
	useMembershipsFieldDefinitions,
} from './hooks/use-field-definitions';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';

import './style.scss';

const purchasesWideFields = [ 'status', 'payment-method' ];
const purchasesDesktopFields = [ 'status' ];
const purchasesMobileFields: string[] = [];
const defaultPerPage = 10;
const defaultSort = {
	field: 'site',
	direction: 'desc' as SortDirection,
};
export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: purchasesDesktopFields,
	sort: defaultSort,
	layout: {},
};

function alterUrlForViewProp(
	url: URL,
	urlKey: string,
	currentViewPropValue: string | number | string[] | number[] | undefined,
	defaultValue?: string | number | undefined
): void {
	if ( currentViewPropValue && defaultValue && currentViewPropValue !== defaultValue ) {
		url.searchParams.set( urlKey, String( currentViewPropValue ) );
	} else if ( currentViewPropValue && ! defaultValue ) {
		url.searchParams.set( urlKey, String( currentViewPropValue ) );
	} else {
		url.searchParams.delete( urlKey );
	}
}

function updateUrlForView( url: URL ): void {
	if ( url.search === window.location.search ) {
		return;
	}
	window.history.pushState( undefined, '', url );
	// getPreviousRoute will not find this updated route unless we set it
	// explicitly. It only records the route when the page first loads.
	// This seems like a bug but it appears to be how it works.
	reduxDispatch( setRoute( window.location.pathname, Object.fromEntries( url.searchParams ) ) );
}

function usePreservePurchasesViewInUrl( {
	currentView,
	setView,
}: {
	currentView: View;
	setView: ( setter: View | ( ( currentView: View ) => View ) ) => void;
} ) {
	const urlSortField = 'purchaseSortField';
	const urlSortDirection = 'purchaseSortDir';
	const urlPaginationPage = 'purchasePageNumber';
	const urlPaginationPerPage = 'purchasePerPage';
	const urlSiteFilterKey = 'purchaseSiteFilter';
	const urlTypeFilterKey = 'purchaseTypeFilter';
	const urlExpiringSoonFilter = 'purchaseExpiringSoonFilter';
	const currentUrl = window.location.href;

	// Apply view from URL
	useEffect( () => {
		const url = new URL( currentUrl );
		const filters: Filter[] = [];
		const siteFilterValue = url.searchParams.get( urlSiteFilterKey );
		const typeFilterValue = url.searchParams.get( urlTypeFilterKey );
		const expiringSoonValue = url.searchParams.get( urlExpiringSoonFilter );
		const pageNumber = url.searchParams.get( urlPaginationPage );
		const perPage = url.searchParams.get( urlPaginationPerPage );
		const sortField = url.searchParams.get( urlSortField );
		const sortDir = (
			url.searchParams.get( urlSortDirection ) === 'asc' ? 'asc' : 'desc'
		) as SortDirection;
		if ( siteFilterValue ) {
			filters.push( { value: siteFilterValue.split( ',' ), operator: 'isAny', field: 'site' } );
		}
		if ( expiringSoonValue ) {
			filters.push( { value: expiringSoonValue, operator: 'is', field: 'expiring-soon' } );
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
		alterUrlForViewProp( url, urlSiteFilterKey, siteFilter?.value );

		const typeFilter = currentView.filters?.find( ( filter ) => filter.field === 'type' );
		alterUrlForViewProp( url, urlTypeFilterKey, typeFilter?.value );

		const expringSoonFilter = currentView.filters?.find(
			( filter ) => filter.field === 'expiring-soon'
		);
		alterUrlForViewProp( url, urlExpiringSoonFilter, expringSoonFilter?.value );

		const pageNumber = currentView.page;
		alterUrlForViewProp( url, urlPaginationPage, pageNumber, 1 );

		const perPage = currentView.perPage;
		alterUrlForViewProp( url, urlPaginationPerPage, perPage, defaultPerPage );

		const sort = currentView.sort;
		alterUrlForViewProp( url, urlSortField, sort?.field, defaultSort.field );
		alterUrlForViewProp( url, urlSortDirection, sort?.direction, defaultSort.direction );

		updateUrlForView( url );
	}, [ currentView ] );
}

function useHidePurchasesFieldsAtCertainWidths( {
	setView,
}: {
	setView: ( setter: View | ( ( view: View ) => View ) ) => void;
} ): void {
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const currentWidth = ( () => {
		if ( isWide ) {
			return 'wide';
		}
		if ( isDesktop ) {
			return 'desktop';
		}
		return 'mobile';
	} )();
	useEffect( () => {
		switch ( currentWidth ) {
			case 'wide': {
				setView( ( view ) => {
					if ( view.fields?.length !== purchasesWideFields.length ) {
						return {
							...view,
							fields: purchasesWideFields,
						};
					}
					return view;
				} );
				return;
			}
			case 'desktop': {
				setView( ( view ) => {
					if ( view.fields?.length !== purchasesDesktopFields.length ) {
						return {
							...view,
							fields: purchasesDesktopFields,
						};
					}
					return view;
				} );
				return;
			}
			case 'mobile': {
				setView( ( view ) => {
					if ( view.fields?.length !== purchasesMobileFields.length ) {
						return {
							...view,
							fields: purchasesMobileFields,
						};
					}
					return view;
				} );
				return;
			}
		}
	}, [ currentWidth, setView ] );
}

export function PurchasesDataViews( {
	purchases,
	sites,
	transferredOwnershipPurchases = [],
	getManagePurchaseUrlFor,
}: {
	purchases: Purchases.Purchase[];
	sites: SiteDetails[];
	transferredOwnershipPurchases?: Purchases.Purchase[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
} ) {
	const translate = useTranslate();
	const [ currentView, setView ] = useState( purchasesDataView );

	// Hide fields at mobile width
	useHidePurchasesFieldsAtCertainWidths( { setView } );

	// Keep track of the current view params in the URL and restore them when the page loads.
	usePreservePurchasesViewInUrl( { currentView, setView } );

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
		transferredOwnershipPurchases,
		getManagePurchaseUrlFor,
	} );
	const { data: adjustedPurchases, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( purchases, currentView, purchasesDataFields );
	}, [ purchases, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: translate( 'Manage purchase', { textOnly: true } ),
				isEligible: ( item: Purchases.Purchase ) => {
					// Hide manage button for transferred ownership purchases
					const hasTransferredOwnership = isTransferredOwnership(
						item.id,
						transferredOwnershipPurchases
					);
					return Boolean( item.domain && item.id ) && ! hasTransferredOwnership;
				},
				callback: ( items: Purchases.Purchase[] ) => {
					const siteUrl = items[ 0 ].siteSlug || items[ 0 ].domain;
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
					page( getManagePurchaseUrlFor( siteUrl, subscriptionId ) );
				},
			},
		],
		[ translate, getManagePurchaseUrlFor, transferredOwnershipPurchases ]
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

const membershipsDesktopFields = [ 'status' ];
const membershipsMobileFields: string[] = [];
export const membershipDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
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
				label: translate( 'Manage purchase', { textOnly: true } ),
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
