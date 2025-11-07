import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useCallback, useMemo } from 'react';
import type { Field, View } from '@wordpress/dataviews';

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
	 * Possible fields that could be displayed in the view.
	 * Used to sanitize the persisted view.
	 */
	defaultFields: Field< any >[];
}

/**
 * Hook for managing DataViews view state.
 * Transient properties (`page` and `search`) are synced to the URL query params,
 * while the rest of the properties is persisted to Calypso preferences.
 */
export function useView( { slug, defaultView, defaultFields }: UseViewOptions ): {
	view: View;
	updateView: ( newView: View ) => void;
	isViewModified: boolean;
	resetView: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-view-${ slug }` as const;

	const { data: persistedView } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: persistView } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	const { search: queryParams } = useLocation();
	const navigate = useNavigate();

	const baseView: View = sanitizeView( persistedView ?? defaultView, defaultFields );

	const page = parseInt( queryParams.page ) || baseView.page || 1;
	const search = queryParams.search || baseView.search || '';

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

	return { view, updateView, isViewModified, resetView };
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

/**
 * Sanitize view by removing any invalid or malformed entries.
 */
function sanitizeView( view: View, defaultFields: Field< any >[] ) {
	// If no sanitization is needed then a reference to the same object should be returned.
	let sanitized = view;

	if ( sanitized.type === 'grid' && sanitized.layout?.previewSize ) {
		// From PreviewSizePicker imageSizes in GB https://github.com/WordPress/gutenberg/blob/58a5abc7714bdff204d5f6bc350980f73686d54f/packages/dataviews/src/dataviews-layouts/grid/preview-size-picker.tsx#L14-L39
		const smallestSize = 120;
		if ( isNaN( sanitized.layout.previewSize ) || sanitized.layout.previewSize < smallestSize ) {
			delete sanitized.layout.previewSize;
		}
	}

	if ( sanitized.sort?.field ) {
		const field = defaultFields.find( ( field ) => field.id === sanitized.sort?.field );
		if ( ! field || field.enableSorting === false ) {
			const { sort, ...rest } = sanitized;
			sanitized = rest;
		}
	}

	return sanitized;
}
