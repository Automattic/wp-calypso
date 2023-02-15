import { Popover } from '@wordpress/components';
import { useMemo, useRef, useState } from 'react';

interface SubmenuPopoverProps extends Popover.Props {
	isVisible?: boolean;
	offset?: number;
	placement?: 'right-start' | 'left-start';
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

export function useSubenuPopoverProps(
	options: {
		placement?: SubmenuPopoverProps[ 'placement' ];
	} = {}
) {
	const { placement = 'right-start' } = options;
	const [ isVisible, setIsVisible ] = useState( false );
	const anchor = useRef< HTMLElement >();
	const hasSpace = useHasRightSpace( anchor?.current );

	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		placement,
		offset: hasSpace ? 0 : anchor?.current?.offsetWidth,
	};

	const parent = {
		ref: anchor,
		onMouseOver: () => setIsVisible( true ),
		// onMouseLeave: () => setIsVisible( false ),
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
