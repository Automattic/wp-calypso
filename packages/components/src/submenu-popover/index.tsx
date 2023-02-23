import { Popover } from '@wordpress/components';
import { LegacyRef, useCallback, useMemo, useRef, useState } from 'react';

interface SubmenuPopoverProps extends Popover.Props {
	children?: React.ReactChild;
	isVisible?: boolean;
	offset?: number | { mainAxis?: number; crossAxis?: number; alignmentAxis?: number | null };
	placement?:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'left'
		| 'left-start'
		| 'left-end';
	anchorRef?: React.MutableRefObject< HTMLElement | undefined >;
	__unstableForcePosition?: boolean;
}

/**
 * Adds a11y support to the submenu popover.
 * - Closes the popover when pressing Escape.
 * - Closes the popover when pressing Tab and the focus is on the last element.
 */
function useCloseSubmenuA11y() {
	return useCallback(
		( {
			event,
			lastChild,
			setIsVisible,
		}: {
			event: React.KeyboardEvent< HTMLElement >;
			lastChild: Element | null | undefined;
			setIsVisible: ( isVisible: boolean ) => void;
		} ) => {
			const isEscape = event.key === 'Escape';
			const tabOnLastChild = event.key === 'Tab' && ! event.shiftKey && lastChild === event.target;
			if ( isEscape || tabOnLastChild ) {
				setIsVisible( false );
			}
		},
		[]
	);
}

/**
 * Checks if the submenu popover has enough space to be displayed on the right.
 * If not, it will return false to be displayed on the left.
 */
function useHasRightSpace( element: HTMLElement | undefined ): boolean {
	return useMemo( () => {
		if ( ! element ) {
			return true;
		}
		const calculatedThreshold = element.offsetWidth * 1.1;
		const { right } = element.getBoundingClientRect();
		return window.innerWidth - right > calculatedThreshold;
	}, [ element ] );
}

export function useSubmenuPopoverProps< T extends HTMLElement >(
	options: { offsetTop?: number } = {}
) {
	const { offsetTop = 0 } = options;
	const [ isVisible, setIsVisible ] = useState( false );
	const anchor = useRef< T >();
	const hasRightSpace = useHasRightSpace( anchor?.current );
	const closeSubmenuA11y = useCloseSubmenuA11y();

	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		placement: hasRightSpace ? 'right-start' : 'left-start',
		anchorRef: anchor,
		offset: { crossAxis: offsetTop },
		__unstableForcePosition: true,
	};

	const parent = {
		ref: anchor as LegacyRef< T >,
		onMouseOver: () => setIsVisible( true ),
		onMouseLeave: () => setIsVisible( false ),
		onClick: () => setIsVisible( true ),
		onKeyDown: ( event: React.KeyboardEvent< T > ) => {
			const lastChild = anchor.current?.querySelector(
				'.submenu-popover > :last-child > :last-child'
			);
			closeSubmenuA11y( { event, lastChild, setIsVisible } );
		},
	};

	return {
		parent,
		submenu,
	};
}

function SubmenuPopover( props: SubmenuPopoverProps ) {
	const { children, isVisible = false, ...rest } = props;
	if ( ! isVisible ) {
		return null;
	}
	return (
		<Popover className="submenu-popover" { ...rest }>
			{ children }
		</Popover>
	);
}

export default SubmenuPopover;
