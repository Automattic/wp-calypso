import { useState, useCallback } from 'react';
import { defaultDataViewsState } from '../constants';
import type { ViewState, ViewStateUpdate, SortableField, Filter } from '../data-views-types';

type Sort =
	| undefined
	| {
			field: string;
			direction: 'asc' | 'desc';
	  };

type Filters = undefined | Filter[];

function verifySortField( field: string ): field is SortableField {
	if ( ! [ 'date', 'service', 'type', 'amount' ].includes( field ) ) {
		return false;
	}
	return true;
}

function areSortsEqual( a: Sort, b: Sort ): boolean {
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

export function useViewStateUpdate() {
	const [ view, setView ] = useState< ViewState >( defaultDataViewsState );

	const scrollToTop = useCallback( () => {
		window.scrollTo( { top: 0, behavior: 'smooth' } );
	}, [] );

	const updateView = ( newView: ViewStateUpdate ) => {
		setView( ( currentView ) => {
			const updatedView = { ...currentView };

			if ( newView.page !== undefined ) {
				updatedView.page = newView.page;
				scrollToTop();
			}

			if ( newView.perPage !== undefined && newView.perPage !== currentView.perPage ) {
				updatedView.perPage = newView.perPage;
				updatedView.page = 1;
				scrollToTop();
			}

			if ( newView.sort && ! areSortsEqual( newView.sort, currentView.sort ) ) {
				// Skip invalid sort fields, keeping the current sort settings
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

			if ( newView.filters && ! areFiltersEqual( newView.filters, currentView.filters ) ) {
				updatedView.filters = newView.filters;
				if ( newView.page === undefined ) {
					updatedView.page = 1;
					scrollToTop();
				}
			}

			if ( newView.search !== undefined && newView.search !== currentView.search ) {
				updatedView.search = newView.search;
				if ( newView.page === undefined ) {
					updatedView.page = 1;
					scrollToTop();
				}
			}

			if ( newView.fields !== undefined ) {
				updatedView.fields = newView.fields;
			}

			return updatedView;
		} );
	};

	return {
		view,
		updateView,
	};
}
