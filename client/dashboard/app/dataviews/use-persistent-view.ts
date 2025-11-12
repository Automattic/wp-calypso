import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useCallback, useMemo } from 'react';
import type { View } from '@wordpress/dataviews';

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
}

/**
 * Hook for managing DataViews view state.
 * Transient properties (`page` and `search`) are synced to the URL query params,
 * while the rest of the properties is persisted to Calypso preferences.
 */
export function usePersistentView( { slug, defaultView, queryParams }: UseViewOptions ): {
	view: View;
	updateView: ( newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-view-${ slug }` as const;

	const { data: persistedView } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: persistView } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	const navigate = useNavigate();

	const baseView = persistedView ?? defaultView;

	const page = parseInt( queryParams?.page ) || baseView.page || 1;
	const search = queryParams?.search || baseView.search || '';

	// Merge transient properties from query params into the view.
	const view: View = useMemo(
		() => ( {
			...baseView,
			page,
			search,
		} ),
		[ baseView, page, search ]
	);

	const updateView = useCallback(
		( newView: View ) => {
			if ( queryParams ) {
				// Sync transient properties to the URL query params.
				const newQueryParams = {
					page: newView.page,
					search: newView.search,
				};
				if ( ! fastDeepEqual( newQueryParams, { page, search } ) ) {
					navigate( {
						search: mergeQueryParams( queryParams, newQueryParams ),
					} );
				}
			}

			// Persist view if different from baseView.
			const viewToPersist = removeQueryParamsFromView( newView );
			if ( ! fastDeepEqual( viewToPersist, baseView ) ) {
				if ( fastDeepEqual( viewToPersist, defaultView ) ) {
					persistView( undefined );
				} else {
					persistView( viewToPersist );
				}
			}
		},
		[ page, search, queryParams, navigate, baseView, defaultView, persistView ]
	);

	const isViewModified = !! persistedView;

	const resetView = useCallback( () => {
		persistView( undefined );
	}, [ persistView ] );

	return { view, updateView, resetView: isViewModified ? resetView : undefined };
}

function removeQueryParamsFromView( view: View ): Omit< View, 'page' | 'search' > {
	const viewToPersist = { ...view };

	delete viewToPersist.page;
	delete viewToPersist.search;

	return viewToPersist;
}

function mergeQueryParams(
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
