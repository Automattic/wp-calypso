import clsx from 'clsx';
import PropTypes from 'prop-types';
import HotkeyContainer from './container-hotkey';
import Gridicon from './gridicons';

const ActionButton = ( { isActive, hotkey, icon, onToggle, text, title } ) => (
	<HotkeyContainer shortcuts={ hotkey ? [ { hotkey, action: onToggle } ] : null }>
		<button
			className={ clsx( 'wpnc__action-link', {
				'active-action': isActive,
				'inactive-action': ! isActive,
			} ) }
			title={ title }
			onClick={ ( event ) => {
				// Prevent the notification panel from being closed.
				event.stopPropagation();
				onToggle();
			} }
		>
			<Gridicon icon={ icon } size={ 24 } />
			<p>{ text }</p>
		</button>
	</HotkeyContainer>
);

ActionButton.propTypes = {
	isActive: PropTypes.bool.isRequired,
	hotkey: PropTypes.number,
	icon: PropTypes.string,
	onToggle: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

export default ActionButton;
