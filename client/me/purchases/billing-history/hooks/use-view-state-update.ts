import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { View, Filter, SortDirection, Field } from '@wordpress/dataviews';
import { isShallowEqualArrays } from '@wordpress/is-shallow-equal';
import { useState, useMemo, useEffect } from 'react';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { useMemoCompare } from 'calypso/lib/use-memo-compare';
import { setRoute } from 'calypso/state/route/actions';
import {
	DEFAULT_PER_PAGE,
	defaultDataViewsState,
	defaultSortField,
	defaultSortDirection,
	desktopFields,
	mobileFields,
	wideFields,
} from '../constants';

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

function writeUrlAfterUpdates( url: URL ): void {
	if ( url.search === window.location.search ) {
		return;
	}
	window.history.pushState( undefined, '', url );
	// getPreviousRoute will not find this updated route unless we set it
	// explicitly. It only records the route when the page first loads.
	// This seems like a bug but it appears to be how it works.
	reduxDispatch( setRoute( window.location.pathname, Object.fromEntries( url.searchParams ) ) );
}

const urlSortField = 'billingSortField';
const urlSortDirection = 'billingSortDir';
const urlPaginationPage = 'billingPageNumber';
const urlPaginationPerPage = 'billingPerPage';

export function updateUrlForView< F >( view: View, fields: Field< F >[] ) {
	const url = new URL( window.location.href );

	const filterKeys = fields.map( ( field ) => field.id );

	filterKeys.forEach( ( filterKey ) => {
		const thisFilter = view.filters?.find( ( filter ) => filter.field === filterKey );
		alterUrlForViewProp( url, filterKey, thisFilter?.value );
	} );

	const pageNumber = view.page;
	alterUrlForViewProp( url, urlPaginationPage, pageNumber, 1 );

	const perPage = view.perPage;
	alterUrlForViewProp( url, urlPaginationPerPage, perPage, DEFAULT_PER_PAGE );

	const sort = view.sort;
	alterUrlForViewProp( url, urlSortField, sort?.field, defaultSortField );
	alterUrlForViewProp( url, urlSortDirection, sort?.direction, defaultSortDirection );

	writeUrlAfterUpdates( url );
}

function useUpdateViewFromUrl< F >( {
	setView,
	fields,
}: {
	setView: ( setter: View | ( ( currentView: View ) => View ) ) => void;
	fields: Field< F >[];
} ) {
	const filterKeys = useMemoCompare(
		fields.map( ( field ) => field.id ),
		isShallowEqualArrays
	);

	const currentUrl = window.location.href;

	// Apply view from URL
	useEffect( () => {
		const url = new URL( currentUrl );
		const filters: Filter[] = [];
		url.searchParams.forEach( ( searchParamValue, searchParamKey ) => {
			if ( filterKeys.includes( searchParamKey ) ) {
				// NOTE: If this needs to handle filter operators other than
				// "is", more work will need to be done to generalize this
				// logic!
				filters.push( {
					value: searchParamValue,
					operator: 'is',
					field: searchParamKey,
				} );
			}
		} );
		const pageNumber = url.searchParams.get( urlPaginationPage );
		const perPage = url.searchParams.get( urlPaginationPerPage );
		const sortField = url.searchParams.get( urlSortField );
		const sortDir = (
			url.searchParams.get( urlSortDirection ) === 'asc' ? 'asc' : 'desc'
		) as SortDirection;
		setView( ( currentView ) => ( {
			...currentView,
			...( filters.length > 0 ? { filters } : {} ),
			...( pageNumber ? { page: parseInt( pageNumber ) } : {} ),
			...( perPage ? { perPage: parseInt( perPage ) } : {} ),
			...( sortField ? { sort: { field: sortField, direction: sortDir } } : {} ),
		} ) );
	}, [ setView, currentUrl, filterKeys ] );
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
					if ( view.fields?.length !== wideFields.length ) {
						return {
							...view,
							fields: wideFields,
						};
					}
					return view;
				} );
				return;
			}
			case 'desktop': {
				setView( ( view ) => {
					if ( view.fields?.length !== desktopFields.length ) {
						return {
							...view,
							fields: desktopFields,
						};
					}
					return view;
				} );
				return;
			}
			case 'mobile': {
				setView( ( view ) => {
					if ( view.fields?.length !== mobileFields.length ) {
						return {
							...view,
							fields: mobileFields,
						};
					}
					return view;
				} );
				return;
			}
		}
	}, [ currentWidth, setView ] );
}

export function useViewStateUpdate< F >( fields: Field< F >[] ) {
	const [ view, setView ] = useState< View >( defaultDataViewsState );

	useUpdateViewFromUrl( { setView, fields } );
	useHidePurchasesFieldsAtCertainWidths( { setView } );

	return useMemo( () => {
		return {
			view,
			updateView: setView,
		};
	}, [ view ] );
}
