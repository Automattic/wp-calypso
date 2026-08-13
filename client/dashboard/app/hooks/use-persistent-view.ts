import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useMatches } from '@tanstack/react-router';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setTransientQueryParamsAtPathname } from '../transient-query-params';
import type { AnyRouteMatch } from '@tanstack/react-router';
import type { Filter, View } from '@wordpress/dataviews';

/**
 * A field whose filter is kept in sync with the URL query params. Provide
 * `values` to restrict the accepted param values; they are canonicalized
 * case-insensitively, so hand-typed URLs keep working.
 */
export type QueryParamFilterField = string | { field: string; values?: readonly string[] };

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
	queryParams?: any;

	/**
	 * Fields whose filters are kept in sync with the URL query params: params
	 * become filters in the returned view, changing the filters in the UI
	 * updates the URL, and they are never persisted to the user preference.
	 * Requires `queryParams`. Fields synced this way should restrict
	 * `filterBy.operators` to `isAny`, as that is the only operator (besides
	 * boolean `is`) a query param can express.
	 */
	queryParamFilterFields?: QueryParamFilterField[];

	/**
	 * Sanitize the field by removing any invalid or malformed entries and migrating deprecated fields.
	 */
	sanitizeFields?: ( fields: View[ 'fields' ] ) => View[ 'fields' ];
}

/**
 * Hook for managing DataViews view state.
 * Transient properties (`page` and `search`) and `queryParamFilterFields`
 * filters are synced to the URL query params, while the rest of the properties
 * is persisted to Calypso preferences.
 */
export function usePersistentView( options: UseViewOptions ) {
	const navigate = useNavigate();
	const matches = useMatches();

	return useBasePersistentView( {
		...options,
		navigate,
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
	navigate: ( {
		search,
		replace,
	}: {
		search: any;
		replace?: boolean;
		resetScroll?: boolean;
	} ) => void;
} ): {
	view: View;
	updateView: ( newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-view-${ slug }` as const;

	const { data: persistedView } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: persistView } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	const baseView = persistedView ?? defaultView;

	const page = parseInt( queryParams?.page ) || baseView.page || 1;
	const search = queryParams?.search || baseView.search || '';

	const transientProperties = useMemo( () => ( { page, search } ), [ page, search ] );

	const filterFieldConfigs = queryParamFilterFields.map( ( config ) =>
		typeof config === 'string' ? { field: config, values: undefined } : config
	);
	const filterFieldNames = queryParams ? filterFieldConfigs.map( ( { field } ) => field ) : [];
	const filterFieldNamesKey = JSON.stringify( filterFieldNames );

	const paramFilterFields = filterFieldNames.filter(
		( field ) => queryParams[ field ] !== undefined
	);

	// Filters derived from the URL query params — the source of truth for
	// synced fields. Derived, not state: it cannot drift from the URL.
	const urlFilters = paramFilterFields.flatMap( ( field ) => {
		const config = filterFieldConfigs.find( ( c ) => c.field === field );
		return getTransientFilter( field, queryParams[ field ], config?.values ) ?? [];
	} );

	// Filters the URL cannot express: chips added via the "Add filter" UI that
	// have no value selected yet. Held separately so an in-progress chip isn't
	// dismissed mid-edit; it graduates to a query param once it gains a value.
	const [ draftFilters, setDraftFilters ] = useState< Filter[] >( [] );

	const urlFilterParamsKey = JSON.stringify(
		paramFilterFields.map( ( field ) => [ field, queryParams?.[ field ] ] )
	);

	useEffect( () => {
		if ( ! matches || matches.length === 0 ) {
			return;
		}

		let transientQueryParams: Record< string, unknown > = {};
		urlFilters.forEach( ( { field } ) => {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ matches, transientProperties, urlFilterParamsKey, queryParams ] );

	// The URL is the source of truth for the synced fields, so persisted filters
	// for them (e.g. from a preference saved before syncing existed) are ignored.
	// A draft yields to the URL if its field gains a param (e.g. via history
	// navigation).
	const view: View = useMemo( () => {
		const activeDraftFilters = draftFilters.filter(
			( filter ) => ! paramFilterFields.includes( filter.field )
		);
		const mergedView = {
			...baseView,
			...transientProperties,
			...( filterFieldNames.length > 0 && {
				filters: [
					...( baseView.filters || [] ).filter(
						( filter ) => ! filterFieldNames.includes( filter.field )
					),
					...urlFilters,
					...activeDraftFilters,
				],
			} ),
		};

		if ( sanitizeFields ) {
			mergedView.fields = sanitizeFields( mergedView.fields );
		}

		return mergedView;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		baseView,
		transientProperties,
		draftFilters,
		urlFilterParamsKey,
		filterFieldNamesKey,
		sanitizeFields,
	] );

	const updateView = useCallback(
		( newView: View ) => {
			const changes = computeUpdateViewChanges( {
				newView,
				queryParams,
				filterFieldNames,
				draftFilters,
				transientProperties,
			} );

			if ( changes.draftFilters ) {
				setDraftFilters( changes.draftFilters );
			}
			if ( changes.navigateSearch ) {
				navigate( {
					search: changes.navigateSearch,
					replace: changes.replace,
					resetScroll: changes.resetScroll,
				} );
			}

			let viewToPersist = newView;
			viewToPersist = removeTransientPropertiesFromView( viewToPersist );
			viewToPersist = removeTransientFiltersFromView( viewToPersist, changes.fieldsToStrip );
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			queryParams,
			transientProperties,
			draftFilters,
			filterFieldNamesKey,
			navigate,
			baseView,
			defaultView,
			persistView,
		]
	);

	const isViewModified = !! persistedView;

	const resetView = useCallback( () => {
		persistView( undefined );
		setDraftFilters( [] );
		navigate( {
			search: mergeQueryParamsWithTransientProperties(
				clearQueryParamsFromTransientFilters( queryParams, filterFieldNames ),
				{ page: 1, search: '' }
			),
			replace: true,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ persistView, navigate, queryParams, filterFieldNamesKey ] );

	return { view, updateView, resetView: isViewModified ? resetView : undefined };
}

/**
 * The transient-state effects an `updateView` call should perform, computed as
 * data so the deciding stays pure and the doing stays mechanical:
 * - `fieldsToStrip`: filter fields to exclude from the persisted view.
 * - `draftFilters`: new draft filter state; `undefined` means leave it untouched.
 * - `navigateSearch`: query params to navigate to; `undefined` means don't navigate.
 */
type UpdateViewChanges = {
	fieldsToStrip: string[];
	draftFilters?: Filter[];
	navigateSearch?: any;
	replace?: boolean;
	resetScroll?: boolean;
};

function computeUpdateViewChanges( {
	newView,
	queryParams,
	filterFieldNames,
	draftFilters,
	transientProperties,
}: {
	newView: View;
	queryParams: any;
	filterFieldNames: string[];
	draftFilters: Filter[];
	transientProperties: { page: number; search: string };
} ): UpdateViewChanges {
	if ( ! queryParams ) {
		return { fieldsToStrip: [] };
	}

	const newQueryParams = { ...queryParams };
	// Synced-field filters that can't be expressed in the URL — no value yet
	// (e.g. just added via the "Add filter" UI) — become drafts instead, so
	// they aren't dismissed mid-edit.
	const newDraftFilters: Filter[] = [];
	let filtersChanged = false;

	filterFieldNames.forEach( ( field ) => {
		const filter = newView.filters?.find( ( f ) => f.field === field );
		const serialized = filter ? serializeTransientFilterValue( filter ) : undefined;
		const current = queryParams[ field ] === undefined ? undefined : String( queryParams[ field ] );

		if ( serialized === undefined ) {
			delete newQueryParams[ field ];
			if ( filter ) {
				newDraftFilters.push( filter );
			}
		} else {
			newQueryParams[ field ] = serialized;
		}

		if ( serialized !== current ) {
			filtersChanged = true;
		}
	} );

	const changes: UpdateViewChanges = { fieldsToStrip: filterFieldNames };

	if ( ! fastDeepEqual( newDraftFilters, draftFilters ) ) {
		changes.draftFilters = newDraftFilters;
	}

	const newTransientProperties = { page: newView.page, search: newView.search };
	const propertiesChanged = ! fastDeepEqual( newTransientProperties, transientProperties );

	if ( filtersChanged || propertiesChanged ) {
		changes.navigateSearch = mergeQueryParamsWithTransientProperties(
			newQueryParams,
			newTransientProperties
		);
		changes.replace = filtersChanged ? true : undefined;
		changes.resetScroll = false;
	}

	return changes;
}

function getTransientFilter(
	field: string,
	rawValue: unknown,
	allowedValues?: readonly string[]
): Filter | undefined {
	const stringValue = String( rawValue );
	if ( stringValue === 'true' || stringValue === 'false' ) {
		return { field, operator: 'is', value: stringValue === 'true' } as Filter;
	}

	let values = stringValue.split( ',' );
	if ( allowedValues ) {
		// '+' is tolerated as an encoded space: the router's search parser uses
		// decodeURIComponent, which leaves it as-is.
		values = Array.from(
			new Set(
				values.flatMap( ( value ) => {
					const normalized = value.replace( /\+/g, ' ' ).trim().toLowerCase();
					const canonical = allowedValues.find( ( v ) => v.toLowerCase() === normalized );
					return canonical === undefined ? [] : [ canonical ];
				} )
			)
		);
		if ( values.length === 0 ) {
			return undefined;
		}
	}
	return { field, operator: 'isAny', value: values } as Filter;
}

function serializeTransientFilterValue( filter: Filter ): string | undefined {
	if ( typeof filter.value === 'boolean' ) {
		return String( filter.value );
	}
	if ( Array.isArray( filter.value ) && filter.value.length > 0 ) {
		return filter.value.map( String ).join( ',' );
	}
	return undefined;
}

function removeTransientPropertiesFromView( view: View ): View {
	const viewToPersist = { ...view };

	delete viewToPersist.page;
	delete viewToPersist.startPosition;
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
