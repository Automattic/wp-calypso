import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Button,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import React, { useState, forwardRef, useRef, useLayoutEffect } from 'react';
import Menu from '../menu';
import { BreadcrumbProps, BreadcrumbItemProps } from './types';
import './style.scss';

function BreadcrumbsMenu( { items }: { items: BreadcrumbItemProps[] } ) {
	return (
		<span className="a8c-components-breadcrumbs__item-wrapper">
			<Menu placement="bottom-start">
				<Menu.TriggerButton
					className="a8c-components-breadcrumbs__item"
					render={ <Button size="compact" text="…" label={ __( 'More breadcrumb items' ) } /> }
				/>
				<Menu.Popover>
					{ items.map( ( item, index ) => (
						<Menu.Item
							key={ `${ item.label }-${ index }` }
							onClick={ item.onClick }
							render={ <a href={ item.href } /> }
						>
							<Menu.ItemLabel>{ item.label }</Menu.ItemLabel>
						</Menu.Item>
					) ) }
				</Menu.Popover>
			</Menu>
		</span>
	);
}

function BreadcrumbItem( { item: { label, href, onClick } }: { item: BreadcrumbItemProps } ) {
	return (
		<span className="a8c-components-breadcrumbs__item-wrapper">
			<a href={ href } onClick={ onClick } className="a8c-components-breadcrumbs__item">
				{ label }
			</a>
		</span>
	);
}

const BreadcrumbsNav = forwardRef<
	HTMLElement,
	BreadcrumbProps & {
		isOffscreen?: boolean;
		shouldRenderCompact: boolean;
	}
>( function BreadcrumbsNav( { isOffscreen, shouldRenderCompact, ...breadcrumbProps }, ref ) {
	const { items, showCurrentItem = false, variant = 'default' } = breadcrumbProps;
	// Always show the first item. The last item (current page) is rendered
	// conditionally based on the `showCurrentItem` prop.
	const hasMiddleItems = items.length > 3;
	const firstItem = items[ 0 ];
	const middleItems = hasMiddleItems ? items.slice( 1, -2 ) : [];
	// Always show the parent item if there are more than 2 items. If there
	// are only 2 items, the parent item is the first item and is already shown.
	const parentItem = items.length > 2 && items[ items.length - 2 ];
	/**
	 * As the container shrinks, multiple breadcrumb items between the first and
	 * last visible item should collapse into a dropdown menu to avoid wrapping.
	 * The current approach is to keep a ref of the `offScreen (full-width)`
	 * container and observe for `inlineSize` changes. If the `offScreen` container
	 * would overflow, we should render the compact variant.
	 * Noting that we prioritize the `isCompact` prop over the `width` checks.
	 */
	const isCompact =
		! isOffscreen && hasMiddleItems && ( variant === 'compact' || shouldRenderCompact );
	const currentItem = (
		<span className="a8c-components-breadcrumbs__item-wrapper is-current">
			<Text
				as="span"
				className="a8c-components-breadcrumbs__item"
				aria-current="page"
				aria-hidden={ ! showCurrentItem }
			>
				{ items[ items.length - 1 ].label }
			</Text>
		</span>
	);
	return (
		<HStack
			as="nav"
			className={ clsx( 'a8c-components-breadcrumbs', { 'is-offscreen': isOffscreen } ) }
			ref={ ref }
			spacing={ 0 }
			justify="flex-start"
			aria-label={ __( 'Breadcrumbs' ) }
			expanded={ false }
			aria-hidden={ isOffscreen }
		>
			<BreadcrumbItem item={ firstItem } />
			{ isCompact ? (
				<BreadcrumbsMenu items={ middleItems } />
			) : (
				middleItems.map( ( item, index ) => (
					<BreadcrumbItem key={ `${ item.label }-${ index }` } item={ item } />
				) )
			) }
			{ parentItem && <BreadcrumbItem item={ parentItem } /> }
			{ showCurrentItem ? currentItem : <VisuallyHidden as="span">{ currentItem }</VisuallyHidden> }
		</HStack>
	);
} );

function UnforwardedBreadcrumbs( props: BreadcrumbProps, ref: React.ForwardedRef< HTMLElement > ) {
	const { items } = props;
	const offScreenRef = useRef< HTMLElement >( null );
	const containerWidth = useRef( 0 );
	const [ shouldRenderCompact, setShouldRenderCompact ] = useState( false );
	const containerRef = useResizeObserver( ( resizeObserverEntries ) => {
		const [ entry ] = resizeObserverEntries;
		const { inlineSize } = entry.borderBoxSize[ 0 ];
		if ( ! offScreenRef.current ) {
			return;
		}
		setShouldRenderCompact( offScreenRef.current.scrollWidth > inlineSize );
		containerWidth.current = inlineSize;
	} );
	// If `items` change we need to recalculate whether we should render the compact variant.
	useLayoutEffect( () => {
		if ( ! offScreenRef.current ) {
			return;
		}
		setShouldRenderCompact( offScreenRef.current.scrollWidth > containerWidth.current );
	}, [ items, setShouldRenderCompact ] );
	const mergedRefs = useMergeRefs( [ ref, containerRef ] );
	if ( ! items.length || items.length === 1 ) {
		return null;
	}
	return (
		<>
			<BreadcrumbsNav
				isOffscreen
				ref={ offScreenRef }
				shouldRenderCompact={ shouldRenderCompact }
				{ ...props }
			/>
			<BreadcrumbsNav ref={ mergedRefs } shouldRenderCompact={ shouldRenderCompact } { ...props } />
		</>
	);
}

/**
 * The breadcrumb component provides a secondary navigation aid that shows users their current
 * location within a site's or application's hierarchy. It helps users understand the structure
 * of the site, retrace their steps, and easily navigate to higher-level pages.
 *
 * For accessibility, it is important that the current page is included as the final item in the
 * breadcrumb trail. This ensures screen reader users receive the full navigational context.
 *
 */
export const Breadcrumbs = forwardRef( UnforwardedBreadcrumbs );
