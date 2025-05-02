import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	NavigableMenu,
	Button,
	Dropdown,
	MenuItem,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useState, forwardRef, useRef } from 'react';
import { BreadcrumbProps, BreadcrumbItemProps } from './types';
import './style.scss';

const popoverProps = {
	placement: 'bottom-start',
};

function BreadcrumbsMenu( { items }: { items: BreadcrumbItemProps[] } ) {
	return (
		<Dropdown
			className="breadcrumb__item-wrapper"
			popoverProps={ popoverProps }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					size="compact"
					className="breadcrumb__item"
					text="…"
					aria-expanded={ isOpen }
					aria-haspopup="true"
					onClick={ onToggle }
					label={ __( 'More breadcrumb items' ) }
				/>
			) }
			renderContent={ () => (
				<NavigableMenu role="menu" aria-label={ __( 'More breadcrumb items' ) }>
					{ items.map( ( item, index ) => (
						<BreadcrumbItem key={ `${ item.label }-${ index }` } item={ item } as={ MenuItem } />
					) ) }
				</NavigableMenu>
			) }
		/>
	);
}

function BreadcrumbItem( {
	item: { label, href, onClick },
	as = 'a',
}: {
	item: BreadcrumbItemProps;
	as?: React.ElementType;
} ) {
	const ButtonComponent = as;
	return (
		<span className="breadcrumb__item-wrapper">
			<ButtonComponent href={ href } onClick={ onClick } className="breadcrumb__item">
				{ label }
			</ButtonComponent>
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
			className="breadcrumb"
			ref={ mergedRefs }
			spacing={ 0 }
			justify="flex-start"
			aria-label="Breadcrumb"
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
