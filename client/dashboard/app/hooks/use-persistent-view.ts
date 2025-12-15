import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useMatches } from '@tanstack/react-router';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setTransientQueryParamsAtPathname } from '../transient-query-params';
import type { Filter, View } from '@wordpress/dataviews';

interface UseViewOptions {
	/**
	 * Unique slug to identify the view.
	 * Used as the suffix for the Calypso preference name.
	 */
	slug: string;

	/**
	 * Default view to use if no persisted view exists yet.
	 */
	defaultView: View;

	/**
	 * The URL query params in the current page.
	 * If passed, transient properties (`page` and `search`) are synced to the URL query params.
	 */
	queryParams?: any;

	/**
	 * Fields that should become transient filters when present in the URL query params.
	 * The returned view's `filters` will be merged with the transient filters.
	 */
	queryParamFilterFields?: string[];
}

/**
 * Hook for managing DataViews view state.
 * Transient properties (`page` and `search`) are synced to the URL query params,
 * while the rest of the properties is persisted to Calypso preferences.
 */
export function usePersistentView( {
	slug,
	defaultView,
	queryParams,
	queryParamFilterFields = [],
}: UseViewOptions ): {
	view: View;
	updateView: ( newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-view-${ slug }` as const;

	const { data: persistedView } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: persistView } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	const navigate = useNavigate();
	const matches = useMatches();

	const baseView = persistedView ?? defaultView;

	const page = parseInt( queryParams?.page ) || baseView.page || 1;
	const search = queryParams?.search || baseView.search || '';

	const transientProperties = useMemo( () => ( { page, search } ), [ page, search ] );

	const transientFilterFields = queryParamFilterFields.filter(
		( field ) => queryParams && queryParams[ field ] !== undefined
	);

	const [ transientFilters, setTransientFilters ] = useState< Filter[] >( [] );

	useEffect( () => {
		setTransientFilters(
			transientFilterFields.map(
				( field ) =>
					( {
						field,
						operator: 'isAny',
						value: [ queryParams[ field ].toString() ],
					} ) as Filter
			)
		);

		// Set transient filters once on initial page load.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ JSON.stringify( transientFilterFields ) ] );

	useEffect( () => {
		if ( matches.length === 0 ) {
			return;
		}

		let transientQueryParams: Record< string, unknown > = {};
		transientFilters.forEach( ( { field } ) => {
			transientQueryParams[ field ] = queryParams[ field ];
		} );
		transientQueryParams = mergeQueryParamsWithTransientProperties(
			transientQueryParams,
			transientProperties
		);
		setTransientQueryParamsAtPathname(
			matches[ matches.length - 1 ].pathname.replace( /\/$/, '' ),
			transientQueryParams
		);
	}, [ matches, transientProperties, transientFilters, queryParams ] );

	// Merge transient properties and filters from query params into the view.
	const view: View = useMemo(
		() => ( {
			...baseView,
			...transientProperties,
			...( transientFilters.length > 0 && {
				filters: [
					...( baseView.filters || [] ).filter(
						( filter ) => ! transientFilterFields.includes( filter.field )
					),
					...transientFilters,
				],
			} ),
		} ),
		[ baseView, transientProperties, transientFilterFields, transientFilters ]
	);

	const updateView = useCallback(
		( newView: View ) => {
			const newTransientFilterFields = transientFilterFields.filter(
				( field ) =>
					newView.filters?.some(
						( filter ) =>
							filter.field === field &&
							fastDeepEqual( filter.value, [ String( queryParams[ field ] ) ] )
					)
			);

			if ( queryParams ) {
				const newTransientProperties = {
					page: newView.page,
					search: newView.search,
				};

				if ( ! fastDeepEqual( newTransientFilterFields, transientFilterFields ) ) {
					setTransientFilters( [] );
					navigate( {
						search: clearQueryParamsFromTransientFilters( queryParams, transientFilterFields ),
						replace: true,
					} );
				} else if ( ! fastDeepEqual( newTransientProperties, transientProperties ) ) {
					navigate( {
						search: mergeQueryParamsWithTransientProperties( queryParams, newTransientProperties ),
					} );
				}
			}

			let viewToPersist = newView;
			viewToPersist = removeTransientPropertiesFromView( viewToPersist );
			viewToPersist = removeTransientFiltersFromView( viewToPersist, newTransientFilterFields );
			viewToPersist = removeEmptyFiltersFromView( viewToPersist );

			// Persist view if different from baseView.
			if ( ! fastDeepEqual( viewToPersist, baseView ) ) {
				if ( fastDeepEqual( viewToPersist, defaultView ) ) {
					persistView( undefined );
				} else {
					persistView( viewToPersist );
				}
			}
		},
		[
			queryParams,
			transientProperties,
			transientFilterFields,
			navigate,
			baseView,
			defaultView,
			persistView,
		]
	);

	const isViewModified = !! persistedView;

	const resetView = useCallback( () => {
		persistView( undefined );
		navigate( {
			search: mergeQueryParamsWithTransientProperties( queryParams, { page: 1, search: '' } ),
			replace: true,
		} );
	}, [ persistView, navigate, queryParams ] );

	return { view, updateView, resetView: isViewModified ? resetView : undefined };
}

function removeTransientPropertiesFromView( view: View ): Omit< View, 'page' | 'search' > {
	const viewToPersist = { ...view };

	delete viewToPersist.page;
	delete viewToPersist.search;

	return viewToPersist;
}

function removeTransientFiltersFromView( view: View, transientFilterFields: string[] ): View {
	return {
		...view,
		filters: view.filters?.filter( ( filter ) => ! transientFilterFields.includes( filter.field ) ),
	};
}

function removeEmptyFiltersFromView( view: View ): View {
	if ( ( view.filters || [] ).length === 0 ) {
		delete view.filters;
	}
	return view;
}

function clearQueryParamsFromTransientFilters( queryParams: any, transientFilterFields: string[] ) {
	const newQueryParams = { ...queryParams };

	transientFilterFields.forEach( ( field ) => {
		delete newQueryParams[ field ];
	} );

	return newQueryParams;
}

function mergeQueryParamsWithTransientProperties(
	queryParams: any,
	{ page, search }: { page?: number; search?: string }
): any {
	const newQueryParams = { ...queryParams };

	if ( page === 1 ) {
		delete newQueryParams.page;
	} else {
		newQueryParams.page = page;
	}

	if ( search === '' ) {
		delete newQueryParams.search;
	} else {
		newQueryParams.search = search;
	}

	return newQueryParams;
}
