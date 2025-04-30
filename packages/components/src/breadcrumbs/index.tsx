import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	DropdownMenu,
	MenuItem,
	Icon,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { moreHorizontal } from '@wordpress/icons';
import { useState, forwardRef, useRef } from 'react';
import { BreadcrumbProps, BreadcrumbItemProps } from './types';
import './style.scss';

const popoverProps = {
	placement: 'bottom-start',
};

function BreadcrumbsMenu( { items }: { items: BreadcrumbItemProps[] } ) {
	return (
		<DropdownMenu
			label={ __( 'More breadcrumb items' ) }
			popoverProps={ popoverProps }
			icon={ <Icon icon={ moreHorizontal } /> }
			toggleProps={ { className: 'breadcrumb__item' } }
		>
			{ () => {
				return items.map( ( item, index ) => (
					<BreadcrumbItem
						key={ `${ item.label }-${ index }` }
						href={ item.href }
						onClick={ item.onClick }
						label={ item.label }
						as={ MenuItem }
						showSeparator={ false }
					/>
				) );
			} }
		</DropdownMenu>
	);
}

function BreadcrumbItem( {
	label,
	href,
	onClick,
	showSeparator = true,
	as = Button,
}: {
	label: string;
	href?: string;
	onClick?: React.MouseEventHandler;
	showSeparator?: boolean;
	as?: React.ElementType;
} ) {
	const ButtonComponent = as;
	const buttonElement = (
		<ButtonComponent href={ href } onClick={ onClick } className="breadcrumb__item">
			{ label }
		</ButtonComponent>
	);
	if ( showSeparator ) {
		return (
			<HStack
				as="span"
				spacing={ 1 }
				justify="flex-start"
				expanded={ false }
				className="breadcrumb__item-wrapper"
			>
				{ buttonElement }
				<BreadcrumbSeparator />
			</HStack>
		);
	}
	return buttonElement;
}

function BreadcrumbSeparator() {
	return (
		<Text as="span" className="breadcrumb__separator" aria-hidden="true" variant="muted">
			/
		</Text>
	);
}

function UnforwardedBreadcrumbs(
	{ items, showCurrentPage = true, isCompact = false }: BreadcrumbProps,
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
	// conditionally based on the `showCurrentPage` prop.
	const hasMiddleItems = items.length > 2;
	const firstItem = items[ 0 ];
	const middleItems = hasMiddleItems ? items.slice( 1, -1 ) : [];
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
		<Text
			as="span"
			className="breadcrumb__item is-current"
			aria-current="page"
			aria-hidden={ ! showCurrentPage }
		>
			{ items[ items.length - 1 ].label }
		</Text>
	);
	return (
		<HStack
			as="nav"
			className="breadcrumb"
			ref={ mergedRefs }
			spacing={ 1 }
			justify="flex-start"
			aria-label="Breadcrumb"
			expanded={ false }
		>
			<BreadcrumbItem
				key={ `first-${ firstItem.label }` }
				label={ firstItem.label }
				href={ firstItem.href }
				onClick={ firstItem.onClick }
			/>
			{ _isCompact ? (
				<HStack
					as="span"
					spacing={ 1 }
					justify="flex-start"
					expanded={ false }
					className="breadcrumb__item-wrapper"
				>
					<BreadcrumbsMenu items={ middleItems } />
					<BreadcrumbSeparator />
				</HStack>
			) : (
				middleItems.map( ( item, index ) => (
					<BreadcrumbItem
						key={ `${ item.label }-${ index }` }
						label={ item.label }
						href={ item.href }
						onClick={ item.onClick }
					/>
				) )
			) }
			{ showCurrentPage ? currentItem : <VisuallyHidden as="span">{ currentItem }</VisuallyHidden> }
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
