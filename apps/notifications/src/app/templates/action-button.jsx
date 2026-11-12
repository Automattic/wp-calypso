import { Button } from '@wordpress/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import HotkeyContainer from './container-hotkey';

const getVariant = ( isActive ) => ( isActive ? 'primary' : 'secondary' );

const ActionButton = ( {
	className,
	icon,
	isActive,
	isBusy,
	isDestructive,
	isMinimal,
	hotkey,
	onToggle,
	text,
	title,
} ) => (
	<HotkeyContainer shortcuts={ hotkey ? [ { hotkey, action: onToggle } ] : null }>
		<Button
			className={ clsx( 'wpnc__action-link', className, {
				'active-action': isActive,
				'inactive-action': ! isActive,
			} ) }
			title={ title }
			size="compact"
			icon={ isMinimal ? icon : undefined }
			variant={ isMinimal ? 'tertiary' : getVariant( isActive ) }
			isDestructive={ isDestructive }
			isBusy={ isBusy }
			disabled={ isBusy }
			accessibleWhenDisabled
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
	className: PropTypes.string,
	isActive: PropTypes.bool.isRequired,
	hotkey: PropTypes.string,
	isDestructive: PropTypes.bool,
	isMinimal: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

export default ActionButton;
