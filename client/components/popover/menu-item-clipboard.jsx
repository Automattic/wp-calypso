import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';

const noop = () => {};

function PopoverMenuItemClipboard( {
	children,
	className,
	text,
	onCopy = noop,
	icon = 'clipboard',
	...rest
} ) {
	return (
		<ClipboardButton
			text={ text }
			onCopy={ onCopy }
			role="menuitem"
			tabIndex="-1"
			className={ classNames( 'popover__menu-item', className ) }
			{ ...rest }
		>
			<Gridicon icon={ icon } size={ 18 } />
			{ children }
		</ClipboardButton>
	);
}

PopoverMenuItemClipboard.propTypes = {
	className: PropTypes.string,
	icon: PropTypes.string,
	onCopy: PropTypes.func,
	text: PropTypes.string,
};

export default PopoverMenuItemClipboard;
