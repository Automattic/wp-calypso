/** @format */
/**
 * External dependencies
 */
import { omit } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import ReaderPopover from 'components/reader-popover';

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
