import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { sanitizeView } from './sanitize-view';
import type { ComponentProps } from 'react';

type WPDataViewsProps< Item > = ComponentProps< typeof WPDataViews< Item > >;

export type DataViewsProps< Item > = WPDataViewsProps< Item > & {
	isPlaceholderData?: boolean;
};

export function DataViews< Item >( { view, isPlaceholderData, ...props }: DataViewsProps< Item > ) {
	const previousPage = useRef( view.page );
	const dataviewsRef = useRef< HTMLDivElement | null >( null );

	useLayoutEffect( () => {
		if ( isDashboardBackport() ) {
			dataviewsRef.current = document.querySelector< HTMLDivElement >( '.dataviews-wrapper' );
		}
	}, [] );

	// Scroll to top only after pagination data loads.
	useEffect( () => {
		if ( isPlaceholderData ) {
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
	}, [ view.page, isPlaceholderData ] );

	const sanitizedView = sanitizeView( view, props.fields );

	return <WPDataViews< Item > view={ sanitizedView } { ...( props as any ) } />;
}

DataViews.Layout = WPDataViews.Layout;
DataViews.Pagination = WPDataViews.Pagination;
