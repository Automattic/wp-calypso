import PropTypes from 'prop-types';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import PopoverMenuItem from './menu-item';

const noop = () => {};

function PopoverMenuItemClipboard( {
	className,
	text,
	onCopy = noop,
	icon = 'clipboard',
	...rest
} ) {
	return (
		<PopoverMenuItem
			itemComponent={ ClipboardButton }
			className={ className }
			icon={ icon }
			text={ text }
			onCopy={ onCopy }
			{ ...rest }
		/>
	);
}

PopoverMenuItemClipboard.propTypes = {
	className: PropTypes.string,
	icon: PropTypes.string,
	onCopy: PropTypes.func,
	text: PropTypes.string,
};

export default PopoverMenuItemClipboard;
