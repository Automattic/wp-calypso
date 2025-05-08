import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Button,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useMergeRefs } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React, { useState, forwardRef, useRef } from 'react';
import Menu from '../menu';
import { BreadcrumbProps, BreadcrumbItemProps } from './types';
import './style.scss';

function BreadcrumbsMenu( { items }: { items: BreadcrumbItemProps[] } ) {
	const { __ } = useI18n();
	return (
		<li className="a8c-components-breadcrumbs__item-wrapper">
			<Menu placement="bottom-start">
				<Menu.TriggerButton
					className="a8c-components-breadcrumbs__item"
					render={
						<Button size="compact" text="__( … )" label={ __( 'More breadcrumb items' ) } />
					}
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
		</li>
	);
}

function BreadcrumbItem( { item: { label, href, onClick } }: { item: BreadcrumbItemProps } ) {
	return (
		<li className="a8c-components-breadcrumbs__item-wrapper">
			<a href={ href } onClick={ onClick } className="a8c-components-breadcrumbs__item">
				{ label }
			</a>
		</li>
	);
}

function BreadcrumbCurrentItem( {
	item: { label },
	visible = false,
}: {
	item: BreadcrumbItemProps;
	visible: boolean;
} ) {
	const content = (
		<Text as="span" className="a8c-components-breadcrumbs__item" aria-current="page">
			{ label }
		</Text>
	);
	return visible ? (
		<li className="a8c-components-breadcrumbs__item-wrapper is-current">{ content }</li>
	) : (
		<VisuallyHidden as="li">{ content }</VisuallyHidden>
	);
}

const BreadcrumbsNav = forwardRef<
	HTMLElement,
	BreadcrumbProps & {
		isOffscreen?: boolean;
	}
>( function BreadcrumbsNav(
	{ isOffscreen, items, showCurrentItem = false, variant = 'default', ...props },
	ref
) {
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
	const isCompact = ! isOffscreen && hasMiddleItems && variant === 'compact';

	return (
		<nav
			className={ clsx( 'a8c-components-breadcrumbs', { 'is-offscreen': isOffscreen } ) }
			ref={ ref }
			{ ...( isOffscreen && { 'aria-hidden': true, inert: '' } ) }
			{ ...props }
		>
			<HStack
				as="ul"
				className="a8c-components-breadcrumbs__list"
				spacing={ 0 }
				justify="flex-start"
				expanded={ false }
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
				<BreadcrumbCurrentItem item={ items[ items.length - 1 ] } visible={ showCurrentItem } />
			</HStack>
		</nav>
	);
} );

function UnforwardedBreadcrumbs(
	{ items, 'aria-label': ariaLabel, ...props }: BreadcrumbProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	const { __ } = useI18n();
	const computedAriaLabel = ariaLabel ?? __( 'Breadcrumbs' );

	const offScreenWidth = useRef( 0 );
	const containerWidth = useRef( 0 );
	const [ shouldRenderCompact, setShouldRenderCompact ] = useState( false );

	const computeShouldRenderCompact = () => {
		setShouldRenderCompact( offScreenWidth.current > containerWidth.current );
	};
	const offScreenRef = useResizeObserver( ( resizeObserverEntries ) => {
		offScreenWidth.current = resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize;
		computeShouldRenderCompact();
	} );
	const containerRef = useResizeObserver( ( resizeObserverEntries ) => {
		containerWidth.current = resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize;
		computeShouldRenderCompact();
	} );

	const mergedRefs = useMergeRefs( [ ref, containerRef ] );
	if ( ! items.length || items.length === 1 ) {
		return null;
	}

	const computedVariant = shouldRenderCompact ? 'compact' : props.variant;

	return (
		<>
			<BreadcrumbsNav
				ref={ offScreenRef }
				items={ items }
				{ ...props }
				variant={ computedVariant }
				isOffscreen
			/>
			<BreadcrumbsNav
				ref={ mergedRefs }
				items={ items }
				{ ...props }
				variant={ computedVariant }
				aria-label={ computedAriaLabel }
			/>
		</>
	);
}

/**
 * The `Breadcrumbs` component provides a secondary navigation aid that shows
 * users their current location within a site's or application's hierarchy.
 * It helps users understand the structure of the site, retrace their steps,
 * and easily navigate to higher-level pages.
 *
 * For accessibility, **it is important that the current page is included as the
 * final item in the breadcrumb trail**. This ensures screen reader users
 * receive the full navigational context.
 */
export const Breadcrumbs = forwardRef( UnforwardedBreadcrumbs );
