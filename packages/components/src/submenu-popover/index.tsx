import { Popover } from '@wordpress/components';
import { LegacyRef, useMemo, useRef, useState } from 'react';

interface SubmenuPopoverProps extends Popover.Props {
	isVisible?: boolean;
	offset?: number;
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
	__unstableForcePosition?: boolean;
}

function useHasRightSpace( element: HTMLElement | undefined ) {
	return useMemo( () => {
		if ( ! element ) {
			return true;
		}
		const calculatedThreshold = element.offsetWidth * 1.1;
		const { right } = element.getBoundingClientRect();
		return window.innerWidth - right > calculatedThreshold;
	}, [ element ] );
}

export function useSubenuPopoverProps< T extends HTMLElement >() {
	const [ isVisible, setIsVisible ] = useState( false );
	const anchor = useRef< T >();
	const hasRightSpace = useHasRightSpace( anchor?.current );

	const anchorRect = anchor?.current?.getBoundingClientRect();
	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		placement: hasRightSpace ? 'right-start' : 'left-start',
		anchorRect: anchorRect,
		__unstableForcePosition: true,
	};

	const parent = {
		ref: anchor as LegacyRef< T >,
		onMouseOver: () => setIsVisible( true ),
		onMouseLeave: () => setIsVisible( false ),
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
