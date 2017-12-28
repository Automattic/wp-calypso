/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal Dependencies
 */
import ReaderPopover from 'client/components/reader-popover';
import PopoverMenu from 'client/components/popover/menu';

const ReaderPopoverMenu = props => {
	const popoverProps = omit( props, 'popoverComponent' );
	return (
		<PopoverMenu
			className="reader-popover__menu"
			popoverComponent={ ReaderPopover }
			{ ...popoverProps }
		>
			{ props.children }
		</PopoverMenu>
	);
};

export default ReaderPopoverMenu;
