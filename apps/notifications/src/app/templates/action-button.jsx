import { Button } from '@wordpress/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import HotkeyContainer from './container-hotkey';

const ActionButton = ( {
	icon,
	isActive,
	isBusy,
	isDestructive,
	hotkey,
	onToggle,
	text,
	title,
	variant,
} ) => (
	<HotkeyContainer shortcuts={ hotkey ? [ { hotkey, action: onToggle } ] : null }>
		<Button
			className={ clsx( 'wpnc__action-link', {
				'active-action': isActive,
				'inactive-action': ! isActive,
			} ) }
			title={ title }
			size="compact"
			icon={ icon }
			variant={ variant ?? ( isActive ? 'primary' : 'secondary' ) }
			isDestructive={ isDestructive }
			isBusy={ isBusy }
			disabled={ isBusy }
			onClick={ ( event ) => {
				// Prevent the notification panel from being closed.
				event.stopPropagation();
				onToggle();
			} }
		>
			{ text }
		</Button>
	</HotkeyContainer>
);

ActionButton.propTypes = {
	isActive: PropTypes.bool.isRequired,
	hotkey: PropTypes.string,
	isDestructive: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	variant: PropTypes.string,
};

export default ActionButton;
