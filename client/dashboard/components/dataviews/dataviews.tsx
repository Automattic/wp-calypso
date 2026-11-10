import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { sanitizeView } from './sanitize-view';
import type { ComponentProps } from 'react';

export type DataViewsProps< Item > = ComponentProps< typeof WPDataViews< Item > > & {
	/**
	 * Called with the last page when the view's page is past it, in place of
	 * the `onChangeView` call DataViews would make. Pass `correctPage` from
	 * `usePersistentView`, so that the URL is corrected without a history entry.
	 */
	onPageCorrection?: ( page: number ) => void;
};

function getLastPage( totalPages: number | null | undefined ) {
	return typeof totalPages === 'number' && Number.isFinite( totalPages )
		? Math.max( totalPages, 1 )
		: undefined;
}

export function DataViews< Item >( {
	view,
	isLoading,
	onPageCorrection,
	...props
}: DataViewsProps< Item > ) {
	const previousPage = useRef( view.page );
	const dataviewsRef = useRef< HTMLDivElement | null >( null );

	useLayoutEffect( () => {
		if ( isDashboardBackport() ) {
			dataviewsRef.current = document.querySelector< HTMLDivElement >( '.dataviews-wrapper' );
		}
	}, [] );

	// Scroll to top only after pagination data loads.
	useEffect( () => {
		if ( isLoading ) {
			return;
		}
		if ( previousPage.current !== view.page ) {
			if ( isDashboardBackport() && dataviewsRef.current ) {
				// In backport (v1), the .dataviews-wrapper is the scrollable container due to sticky header.
				dataviewsRef.current.scrollTo( { top: 0, behavior: 'instant' } );
			} else {
				// In v2, the window is the scrollable container.
				window.scrollTo( { top: 0, behavior: 'instant' } );
			}
			previousPage.current = view.page;
		}
	}, [ view.page, isLoading ] );

	const lastPage = getLastPage( props.paginationInfo?.totalPages );
	const isPastLastPage = ! isLoading && lastPage !== undefined && ( view.page ?? 1 ) > lastPage;
	const correctedPage = onPageCorrection && isPastLastPage ? lastPage : undefined;

	useEffect( () => {
		if ( correctedPage !== undefined ) {
			onPageCorrection?.( correctedPage );
		}
	}, [ correctedPage, onPageCorrection ] );

	const sanitizedView = sanitizeView(
		correctedPage !== undefined ? { ...view, page: correctedPage } : view,
		props.fields
	);

	return (
		<WPDataViews< Item > view={ sanitizedView } isLoading={ isLoading } { ...( props as any ) } />
	);
}

DataViews.Layout = WPDataViews.Layout;
DataViews.Pagination = WPDataViews.Pagination;
DataViews.Search = WPDataViews.Search;
