import { isEqual } from 'lodash';
import { useState, useCallback } from 'react';
import { defaultDataViewsState } from '../constants';
import type { ViewState, ViewStateUpdate, SortableField } from '../data-views-types';

export function useViewStateUpdate() {
	const [ view, setView ] = useState< ViewState >( defaultDataViewsState );

	const scrollToTop = useCallback( () => {
		window.scrollTo( { top: 0, behavior: 'smooth' } );
	}, [] );

	const updateView = ( newView: ViewStateUpdate ) => {
		setView( ( currentView ) => {
			const updatedView = { ...currentView } as ViewState;

			if ( newView.page !== undefined ) {
				updatedView.page = newView.page;
				scrollToTop();
			}

			if ( newView.perPage !== undefined && newView.perPage !== currentView.perPage ) {
				updatedView.perPage = newView.perPage;
				updatedView.page = 1;
				scrollToTop();
			}

			if ( newView.sort && ! isEqual( newView.sort, currentView.sort ) ) {
				updatedView.sort = {
					field: newView.sort.field as SortableField,
					direction: newView.sort.direction,
				};
				if ( newView.page === undefined ) {
					updatedView.page = 1;
					scrollToTop();
				}
			}

			if ( newView.filters && ! isEqual( newView.filters, currentView.filters ) ) {
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
