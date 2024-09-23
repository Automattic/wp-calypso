import { Button } from '@wordpress/components';
import { Icon, check, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { DateControlPickerShortcutsProps } from './types';

const DateControlPickerShortcuts = ( {
	shortcutList,
	currentShortcut,
	onClick,
}: DateControlPickerShortcutsProps ) => {
	return (
		<div className="date-control-picker-shortcuts">
			<ul className="date-control-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => {
					const isSelected = shortcut.id === currentShortcut;

					return (
						<li
							className={ clsx( 'date-control-picker-shortcuts__shortcut', {
								[ 'is-selected' ]: isSelected,
							} ) }
							key={ shortcut.id || idx }
						>
							<Button
								key={ shortcut.id || idx }
								onClick={ () => {
									onClick( shortcut );
								} }
								aria-label={ `Time range ${ shortcut.label }. Click to select and close filter options.` }
							>
								<span>{ shortcut.label }</span>
								{ isSelected && <Icon icon={ check } /> }
								{ shortcut.isGated && <Icon icon={ lock } /> }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

export default DateControlPickerShortcuts;
