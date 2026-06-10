import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useMatches } from '@tanstack/react-router';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setTransientQueryParamsAtPathname } from '../transient-query-params';
import type { AnyRouteMatch } from '@tanstack/react-router';
import type { Filter, View } from '@wordpress/dataviews';

type QueryParams = Record< string, unknown >;

type UseViewNavigate = ( options: {
	search: QueryParams;
	replace?: boolean;
	resetScroll?: boolean;
} ) => void;

export interface UseViewOptions {
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
	queryParams?: QueryParams;

	/**
	 * Fields that should become transient filters when present in the URL query params.
	 * The returned view's `filters` will be merged with the transient filters.
	 */
	queryParamFilterFields?: string[];

	/**
	 * Sanitize the field by removing any invalid or malformed entries and migrating deprecated fields.
	 */
	sanitizeFields?: ( fields: View[ 'fields' ] ) => View[ 'fields' ];
}

/**
 * Hook for managing DataViews view state.
 * Transient properties (`page` and `search`) are synced to the URL query params,
 * while the rest of the properties is persisted to Calypso preferences.
 */
export function usePersistentView( options: UseViewOptions ) {
	const navigate = useNavigate();
	const matches = useMatches();

	return useBasePersistentView( {
		...options,
		// The TanStack navigate function is wider than UseViewNavigate, but its
		// loosely-typed `search` option rejects plain query param objects.
		navigate: navigate as unknown as UseViewNavigate,
		matches,
	} );
}

export function useBasePersistentView( {
	slug,
	defaultView,
	queryParams,
	queryParamFilterFields = [],
	matches,
	sanitizeFields,
	navigate,
}: UseViewOptions & {
	matches?: AnyRouteMatch[];
	navigate: UseViewNavigate;
} ): {
	view: View;
	updateView: ( newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-view-${ slug }` as const;

	const { data: persistedView } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: persistView } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	const baseView = persistedView ?? defaultView;

	const page = parseInt( queryParams?.page as string ) || baseView.page || 1;
	const search = ( queryParams?.search as string ) || baseView.search || '';

	const transientProperties = useMemo( () => ( { page, search } ), [ page, search ] );

	const transientFilterFields = queryParamFilterFields.filter(
		( field ) => queryParams && queryParams[ field ] !== undefined
	);

	const [ transientFilters, setTransientFilters ] = useState< Filter[] >( () =>
		queryParamFilterFields
			.filter( ( field ) => queryParams && queryParams[ field ] !== undefined )
			.map( ( field ) => getTransientFilter( field, queryParams?.[ field ] ) )
	);

	useEffect( () => {
		setTransientFilters(
			transientFilterFields.map( ( field ) => getTransientFilter( field, queryParams?.[ field ] ) )
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ JSON.stringify( transientFilterFields ) ] );

	useEffect( () => {
		if ( ! matches || matches.length === 0 ) {
			return;
		}

		let transientQueryParams: Record< string, unknown > = {};
		transientFilters.forEach( ( { field } ) => {
			transientQueryParams[ field ] = queryParams?.[ field ];
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
	const view: View = useMemo( () => {
		const mergedView = {
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
		};

		if ( sanitizeFields ) {
			mergedView.fields = sanitizeFields( mergedView.fields );
		}

		return mergedView;
	}, [ baseView, transientProperties, transientFilterFields, transientFilters, sanitizeFields ] );

	const updateView = useCallback(
		( newView: View ) => {
			const newTransientFilterFields = transientFilterFields.filter(
				( field ) =>
					newView.filters?.some(
						( filter ) =>
							filter.field === field &&
							fastDeepEqual(
								filter.value,
								getTransientFilter( field, queryParams?.[ field ] ).value
							)
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
						resetScroll: false,
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

function getTransientFilter( field: string, rawValue: unknown ): Filter {
	const stringValue = String( rawValue );
	if ( stringValue === 'true' || stringValue === 'false' ) {
		return { field, operator: 'is', value: stringValue === 'true' } as Filter;
	}
	return { field, operator: 'isAny', value: [ stringValue ] } as Filter;
}

function removeTransientPropertiesFromView( view: View ): View {
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

function clearQueryParamsFromTransientFilters(
	queryParams: QueryParams,
	transientFilterFields: string[]
) {
	const newQueryParams = { ...queryParams };

	transientFilterFields.forEach( ( field ) => {
		delete newQueryParams[ field ];
	} );

	return newQueryParams;
}

function mergeQueryParamsWithTransientProperties(
	queryParams: QueryParams | undefined,
	{ page, search }: { page?: number; search?: string }
): QueryParams {
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
