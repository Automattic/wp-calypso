import { Popover } from '@wordpress/components';
import {
	LegacyRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	ComponentProps,
} from 'react';

type SubmenuPopoverProps = ComponentProps< typeof Popover > & {
	isVisible?: boolean;
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
	anchor?: Element | undefined;
	flip?: boolean;
	resize?: boolean;
	inline?: boolean;
};

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
function useHasRightSpace( parentElement: HTMLElement | undefined, isVisible: boolean ): boolean {
	const [ widthSubmenu, setWidthSubmenu ] = useState( 0 );

	useEffect( () => {
		if ( isVisible && parentElement ) {
			const submenuElement = parentElement.querySelector< HTMLElement >( '.submenu-popover' );
			if ( submenuElement ) {
				setWidthSubmenu( submenuElement.offsetWidth );
			}
		}
	}, [ parentElement, isVisible ] );

	return useMemo( () => {
		if ( ! parentElement ) {
			return true;
		}
		const calculatedThreshold = widthSubmenu;
		const { right } = parentElement.getBoundingClientRect();
		return window.innerWidth - right > calculatedThreshold;
	}, [ parentElement, widthSubmenu ] );
}

export function useSubmenuPopoverProps< T extends HTMLElement >(
	options: Omit< SubmenuPopoverProps, 'isVisible' | 'placement' | 'anchor' | 'children' > = {
		offset: 0,
		flip: true,
		resize: true,
		inline: false,
	}
) {
	const { offset, inline, flip, resize } = options;
	const [ isVisible, setIsVisible ] = useState( false );
	const anchor = useRef< T >();
	const parentElement = anchor?.current;
	const hasRightSpace = useHasRightSpace( parentElement, isVisible );
	const closeSubmenuA11y = useCloseSubmenuA11y();

	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		placement: hasRightSpace ? 'right-start' : 'left-start',
		anchor: anchor?.current,
		offset,
		flip,
		resize,
		inline,
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
