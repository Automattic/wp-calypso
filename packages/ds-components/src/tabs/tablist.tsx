/**
 * External dependencies
 */
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import warning from '@wordpress/warning';
import { forwardRef, useLayoutEffect, useState } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import type { TabListProps } from './types';
import type { WordPressComponentProps } from '../context';
import type { ElementOffsetRect } from '../utils/element-rect';
import { useTabsContext } from './context';
import { StyledTabList } from './styles';
import { useTrackElementOffsetRect } from '../utils/element-rect';
import { useTrackOverflow } from './use-track-overflow';
import { useAnimatedOffsetRect } from '../utils/hooks/use-animated-offset-rect';

const DEFAULT_SCROLL_MARGIN = 24;

/**
 * Scrolls a given parent element so that a given rect is visible.
 *
 * The scroll is updated initially and whenever the rect changes.
 */
function useScrollRectIntoView(
	parent: HTMLElement | undefined,
	rect: ElementOffsetRect,
	{ margin = DEFAULT_SCROLL_MARGIN } = {}
) {
	useLayoutEffect( () => {
		if ( ! parent || ! rect ) {
			return;
		}

		const { scrollLeft: parentScroll } = parent;
		const parentWidth = parent.getBoundingClientRect().width;
		const { left: childLeft, width: childWidth } = rect;

		const parentRightEdge = parentScroll + parentWidth;
		const childRightEdge = childLeft + childWidth;
		const rightOverflow = childRightEdge + margin - parentRightEdge;
		const leftOverflow = parentScroll - ( childLeft - margin );

		let scrollLeft = null;
		if ( leftOverflow > 0 ) {
			scrollLeft = parentScroll - leftOverflow;
		} else if ( rightOverflow > 0 ) {
			scrollLeft = parentScroll + rightOverflow;
		}

		if ( scrollLeft !== null ) {
			/**
			 * The optional chaining is used here to avoid unit test failures.
			 * It can be removed when JSDOM supports `Element` scroll methods.
			 * See: https://github.com/WordPress/gutenberg/pull/66498#issuecomment-2441146096
			 */
			parent.scroll?.( { left: scrollLeft } );
		}
	}, [ margin, parent, rect ] );
}

export const TabList = forwardRef<
	HTMLDivElement,
	WordPressComponentProps< TabListProps, 'div', false >
>( function TabList( { children, ...otherProps }, ref ) {
	const { store } = useTabsContext() ?? {};

	const selectedId = Ariakit.useStoreState( store, 'selectedId' );
	const activeId = Ariakit.useStoreState( store, 'activeId' );
	const selectOnMove = Ariakit.useStoreState( store, 'selectOnMove' );
	const items = Ariakit.useStoreState( store, 'items' );
	const [ parent, setParent ] = useState< HTMLElement >();
	const refs = useMergeRefs( [ ref, setParent ] );

	const selectedItem = store?.item( selectedId );
	const renderedItems = Ariakit.useStoreState( store, 'renderedItems' );

	const selectedItemIndex =
		renderedItems && selectedItem
			? renderedItems.indexOf( selectedItem )
			: -1;
	// Use selectedItemIndex as a dependency to force recalculation when the
	// selected item index changes (elements are swapped / added / removed).
	const selectedRect = useTrackElementOffsetRect( selectedItem?.element, [
		selectedItemIndex,
	] );

	// Track overflow to show scroll hints.
	const overflow = useTrackOverflow( parent, {
		first: items?.at( 0 )?.element,
		last: items?.at( -1 )?.element,
	} );

	// Size, position, and animate the indicator.
	useAnimatedOffsetRect( parent, selectedRect, {
		prefix: 'selected',
		dataAttribute: 'indicator-animated',
		transitionEndFilter: ( event ) => event.pseudoElement === '::before',
		roundRect: true,
	} );

	// Make sure selected tab is scrolled into view.
	useScrollRectIntoView( parent, selectedRect );

	const onBlur = () => {
		if ( ! selectOnMove ) {
			return;
		}

		// When automatic tab selection is on, make sure that the active tab is up
		// to date with the selected tab when leaving the tablist. This makes sure
		// that the selected tab will receive keyboard focus when tabbing back into
		// the tablist.
		if ( selectedId !== activeId ) {
			store?.setActiveId( selectedId );
		}
	};

	if ( ! store ) {
		warning( '`Tabs.TabList` must be wrapped in a `Tabs` component.' );
		return null;
	}

	return (
		<StyledTabList
			ref={ refs }
			store={ store }
			render={ ( props ) => (
				<div
					{ ...props }
					// Fallback to -1 to prevent browsers from making the tablist
					// tabbable when it is a scrolling container.
					tabIndex={ props.tabIndex ?? -1 }
				/>
			) }
			onBlur={ onBlur }
			data-select-on-move={ selectOnMove ? 'true' : 'false' }
			{ ...otherProps }
			className={ clsx(
				overflow.first && 'is-overflowing-first',
				overflow.last && 'is-overflowing-last',
				otherProps.className
			) }
		>
			{ children }
		</StyledTabList>
	);
} );
