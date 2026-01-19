import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { sanitizeView } from './sanitize-view';
import type { ComponentProps } from 'react';

type WPDataViewsProps< Item > = ComponentProps< typeof WPDataViews< Item > >;

export type DataViewsProps< Item > = WPDataViewsProps< Item > & {
	isPlaceholderData?: boolean;
	onResetView?: () => void;
};

export function DataViews< Item >( {
	view,
	isPlaceholderData,
	onResetView,
	header,
	search = true,
	searchLabel,
	children,
	...props
}: DataViewsProps< Item > ) {
	const previousPage = useRef( view.page );

	// Scroll to top only after pagination data loads.
	useEffect( () => {
		if ( isPlaceholderData ) {
			return;
		}
		if ( previousPage.current !== view.page ) {
			window.scrollTo( { top: 0, behavior: 'instant' } );
			previousPage.current = view.page;
		}
	}, [ view.page, isPlaceholderData ] );

	const sanitizedView = sanitizeView( view, props.fields );

	const resetViewAction = onResetView && (
		<Button variant="tertiary" size="compact" onClick={ onResetView }>
			{ __( 'Reset view' ) }
		</Button>
	);

	const renderChildren = () => {
		if ( children ) {
			return children;
		}

		return (
			<>
				<HStack
					alignment="top"
					justify="space-between"
					className="dataviews__view-actions"
					spacing={ 1 }
				>
					<HStack justify="start" expanded={ false } className="dataviews__search">
						{ search && <WPDataViews.Search label={ searchLabel } /> }
						<WPDataViews.FiltersToggle />
					</HStack>
					<HStack spacing={ 1 } expanded={ false } style={ { flexShrink: 0 } }>
						{ resetViewAction }
						<WPDataViews.LayoutSwitcher />
						<WPDataViews.ViewConfig />
						{ header }
					</HStack>
				</HStack>
				<WPDataViews.FiltersToggled className="dataviews-filters__container" />
				<WPDataViews.Layout />
				<WPDataViews.Footer />
			</>
		);
	};

	// TODO: apply local styles if necessary.
	return (
		<WPDataViews< Item >
			view={ sanitizedView }
			header={ header }
			search={ search }
			searchLabel={ searchLabel }
			{ ...( props as any ) }
		>
			{ renderChildren() }
		</WPDataViews>
	);
}

DataViews.Layout = WPDataViews.Layout;
DataViews.Pagination = WPDataViews.Pagination;
