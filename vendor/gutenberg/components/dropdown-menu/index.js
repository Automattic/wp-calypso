/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { DOWN } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import './style.scss';
import IconButton from '../icon-button';
import Dashicon from '../dashicon';
import Dropdown from '../dropdown';
import { NavigableMenu } from '../navigable-container';

function DropdownMenu( {
	icon = 'menu',
	label,
	menuLabel,
	controls,
} ) {
	if ( ! controls || ! controls.length ) {
		return null;
	}

	return (
		<Dropdown
			className="components-dropdown-menu"
			contentClassName="components-dropdown-menu__popover"
			renderToggle={ ( { isOpen, onToggle } ) => {
				const openOnArrowDown = ( event ) => {
					if ( ! isOpen && event.keyCode === DOWN ) {
						event.preventDefault();
						event.stopPropagation();
						onToggle();
					}
				};
				return (
					<IconButton
						className={
							classnames( 'components-dropdown-menu__toggle', {
								'is-active': isOpen,
							} )
						}
						icon={ icon }
						onClick={ onToggle }
						onKeyDown={ openOnArrowDown }
						aria-haspopup="true"
						aria-expanded={ isOpen }
						label={ label }
						tooltip={ label }
					>
						<Dashicon icon="arrow-down" />
					</IconButton>
				);
			} }
			renderContent={ ( { onClose } ) => {
				return (
					<NavigableMenu
						className="components-dropdown-menu__menu"
						role="menu"
						aria-label={ menuLabel }
					>
						{ controls.map( ( control, index ) => (
							<IconButton
								key={ index }
								onClick={ ( event ) => {
									event.stopPropagation();
									onClose();
									if ( control.onClick ) {
										control.onClick();
									}
								} }
								className="components-dropdown-menu__menu-item"
								icon={ control.icon }
								role="menuitem"
							>
								{ control.title }
							</IconButton>
						) ) }
					</NavigableMenu>
				);
			} }
		/>
	);
}

export default DropdownMenu;
