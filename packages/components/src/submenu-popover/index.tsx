import { Popover } from '@wordpress/components';
import { useRef, useState, RefObject } from 'react';

interface SubmenuPopoverProps extends Popover.Props {
	isVisible?: boolean;
	offset?: number;
}

export function useSubenuPopoverProps< T extends { offsetWidth: number } >() {
	const [ isVisible, setIsVisible ] = useState( false );
	const anchor = useRef< T >();

	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		offset: anchor.current?.offsetWidth,
		position: 'middle right',
	};

	const parent = {
		ref: anchor as RefObject< T >,
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
