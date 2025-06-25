import { View } from '@wordpress/dataviews';
import { useState, useCallback, useMemo } from 'react';
import { defaultDataViewsState } from '../constants';
import type { SortableField, Filter, Sort } from '../data-views-types';

type Filters = undefined | Filter[];

interface ViewStateUpdateResult {
	view: View;
	updateView: ( newView: View ) => void;
}

function scrollToTop(): void {
	window.scrollTo( { top: 0, behavior: 'smooth' } );
}

function verifySortField( field: string ): field is SortableField {
	return [ 'date', 'service', 'type', 'amount' ].includes( field );
}

function areSortsEqual( a: Sort | undefined, b: Sort | undefined ): boolean {
	if ( a?.field !== b?.field ) {
		return false;
	}
	if ( a?.direction !== b?.direction ) {
		return false;
	}
	return true;
}

function areFiltersEqual( a: Filters, b: Filters ): boolean {
	if ( a === b ) {
		return true;
	}
	if ( ! a || ! b ) {
		return false;
	}
	if ( a.length !== b.length ) {
		return false;
	}
	return a.every(
		( filter, index ) =>
			filter.field === b[ index ].field &&
			filter.operator === b[ index ].operator &&
			filter.value === b[ index ].value
	);
}

function handlePageUpdate( updatedView: View, newView: View ): void {
	if ( newView.page !== undefined ) {
		updatedView.page = newView.page;
		scrollToTop();
	}
}

function handlePerPageUpdate( updatedView: View, currentView: View, newView: View ): void {
	if ( newView.perPage !== undefined && newView.perPage !== currentView.perPage ) {
		updatedView.perPage = newView.perPage;
		updatedView.page = 1;
		scrollToTop();
	}
}

function handleSortUpdate( updatedView: View, currentView: View, newView: View ): void {
	if ( newView.sort && ! areSortsEqual( newView.sort, currentView.sort ) ) {
		if ( verifySortField( newView.sort.field ) ) {
			updatedView.sort = {
				field: newView.sort.field,
				direction: newView.sort.direction,
			};
			if ( newView.page === undefined ) {
				updatedView.page = 1;
				scrollToTop();
			}
		}
	}
}

function handleFiltersUpdate( updatedView: View, currentView: View, newView: View ): void {
	if ( newView.filters && ! areFiltersEqual( newView.filters, currentView.filters ) ) {
		updatedView.filters = newView.filters;
		if ( newView.page === undefined ) {
			updatedView.page = 1;
			scrollToTop();
		}
	}
}

function handleSearchUpdate( updatedView: View, currentView: View, newView: View ): void {
	if ( newView.search !== undefined && newView.search !== currentView.search ) {
		updatedView.search = newView.search;
		if ( newView.page === undefined ) {
			updatedView.page = 1;
			scrollToTop();
		}
	}
}

function handleFieldsUpdate( updatedView: View, newView: View ): void {
	if ( newView.fields !== undefined ) {
		updatedView.fields = newView.fields;
	}
}

export function useViewStateUpdate(): ViewStateUpdateResult {
	const [ view, setView ] = useState< View >( defaultDataViewsState );

	const updateView = useCallback( ( newView: View ) => {
		setView( ( currentView ) => {
			const updatedView = { ...currentView };

			handlePageUpdate( updatedView, newView );
			handlePerPageUpdate( updatedView, currentView, newView );
			handleSortUpdate( updatedView, currentView, newView );
			handleFiltersUpdate( updatedView, currentView, newView );
			handleSearchUpdate( updatedView, currentView, newView );
			handleFieldsUpdate( updatedView, newView );

			return updatedView;
		} );
	}, [] );

	return useMemo( () => {
		return {
			view,
			updateView,
		};
	}, [ view, updateView ] );
}
