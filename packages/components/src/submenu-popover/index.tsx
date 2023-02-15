import { Popover } from '@wordpress/components';
import { useState } from 'react';

interface SubmenuPopoverProps extends Popover.Props {
	isVisible?: boolean;
	offset?: number;
	placement?: 'right-start' | 'left-start';
}

export function useSubenuPopoverProps(
	options: {
		placement?: SubmenuPopoverProps[ 'placement' ];
	} = {}
) {
	const { placement = 'right-start' } = options;
	const [ isVisible, setIsVisible ] = useState( false );

	const submenu: Partial< SubmenuPopoverProps > = {
		isVisible,
		placement,
	};

	const parent = {
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
