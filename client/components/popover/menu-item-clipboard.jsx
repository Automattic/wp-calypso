/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import ClipboardButton from 'calypso/components/forms/clipboard-button';

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
