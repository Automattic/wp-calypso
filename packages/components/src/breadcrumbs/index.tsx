import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Button,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useState, forwardRef, useRef } from 'react';
import Menu from '../menu';
import { BreadcrumbProps, BreadcrumbItemProps } from './types';
import './style.scss';

function BreadcrumbsMenu( { items }: { items: BreadcrumbItemProps[] } ) {
	return (
		<span className="breadcrumb__item-wrapper">
			<Menu placement="bottom-start">
				<Menu.TriggerButton
					render={
						<Button
							size="compact"
							className="breadcrumb__item"
							text="…"
							label={ __( 'More breadcrumb items' ) }
						/>
					}
				/>
				<Menu.Popover>
					{ items.map( ( item, index ) => (
						<Menu.Item
							key={ `${ item.label }-${ index }` }
							render={
								<a href={ item.href } onClick={ item.onClick } className="breadcrumb__item" />
							}
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
		<span className="breadcrumb__item-wrapper">
			<a href={ href } onClick={ onClick } className="breadcrumb__item">
				{ label }
			</a>
		</span>
	);
}

function UnforwardedBreadcrumbs(
	{ items, showCurrentItem = false, isCompact = false }: BreadcrumbProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	const scrollWidth = useRef( 0 );
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const containerRef = useResizeObserver( ( resizeObserverEntries ) => {
		const [ entry ] = resizeObserverEntries;
		const { inlineSize } = entry.borderBoxSize[ 0 ];
		/**
		 * We only need to set the `scrollWidth` once, but we also need to ensure
		 * that it is only set when there was no previous value and it's different
		 * than the container's `inlineSize`. This is because the `nav` element expands
		 * to the available space and in a large container where the `nav` doesn't overflow,
		 * would have the same value for `scrollWidth` and `inlineSize`.
		 * We cannot set something like `width: fit-content`, as it would never
		 * expand (hide the dropdown) in future resizes.
		 */
		if ( ! scrollWidth?.current && entry.target.scrollWidth !== inlineSize ) {
			scrollWidth.current = entry.target.scrollWidth;
		}
		setContainerWidth( resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize );
	} );
	const mergedRefs = useMergeRefs( [ ref, containerRef ] );
	if ( ! items.length || items.length === 1 ) {
		return null;
	}
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
	 * The current approach is to calcualte and keep the original `scrollWidth` of
	 * the container and observe for `inlineSize` changes. If the container would
	 * overflow, we set the `_isCompact` prop to true.
	 * Noting that we prioritize the `isCompact` prop over the `scrollWidth` check.
	 */
	const _isCompact = hasMiddleItems && ( isCompact || containerWidth < scrollWidth.current );
	const currentItem = (
		<span className="breadcrumb__item-wrapper is-current">
			<Text
				as="span"
				className="breadcrumb__item"
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
			className="breadcrumbs"
			ref={ mergedRefs }
			spacing={ 0 }
			justify="flex-start"
			aria-label={ __( 'Breadcrumbs' ) }
			expanded={ false }
		>
			<BreadcrumbItem item={ firstItem } />
			{ _isCompact ? (
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
}

export const Breadcrumbs = forwardRef( UnforwardedBreadcrumbs );

/**
 * The breadcrumb component provides a secondary navigation aid that shows users their current
 * location within a site's or application's hierarchy. It helps users understand the structure
 * of the site, retrace their steps, and easily navigate to higher-level pages.
 *
 * For accessibility, it is important that the current page is included as the final item in the
 * breadcrumb trail. This ensures screen reader users receive the full navigational context.
 *
 */
export default Breadcrumbs;
