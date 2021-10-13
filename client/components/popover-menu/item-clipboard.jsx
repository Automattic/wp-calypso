import PropTypes from 'prop-types';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import PopoverMenuItem from './item';

const noop = () => {};

function PopoverMenuItemClipboard( {
	className,
	children,
	text,
	onCopy = noop,
	icon = 'clipboard',
	...rest
} ) {
	return (
		<PopoverMenuItem
			itemComponent={ ClipboardButton }
			className={ className }
			children={ children }
			icon={ icon }
			text={ text }
			onCopy={ onCopy }
			{ ...rest }
		/>
	);
}

PopoverMenuItemClipboard.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node,
	icon: PropTypes.string,
	onCopy: PropTypes.func,
	text: PropTypes.string,
};

export default PopoverMenuItemClipboard;
