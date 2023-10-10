import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import React from 'react';
import { DateControlPickerShortcut, DateControlPickerShortcutsProps } from './types';

const DateControlPickerShortcuts = ( {
	shortcutList,
	currentShortcut,
	onClick,
}: DateControlPickerShortcutsProps ) => {
	// Simple selection test.
	function isSelectedShortcut( shortcut: DateControlPickerShortcut ) {
		return shortcut.id === currentShortcut;
	}
	// Apply selection state via CSS.
	function classNameForShortcut( shortcut: DateControlPickerShortcut ): string {
		const defaultClassName = 'date-control-picker-shortcuts__shortcut';
		const selectedClassName = defaultClassName + ' is-selected';
		return isSelectedShortcut( shortcut ) ? selectedClassName : defaultClassName;
	}

	return (
		<div className="date-control-picker-shortcuts">
			<ul className="date-control-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => (
					<li className={ classNameForShortcut( shortcut ) } key={ shortcut.id || idx }>
						<Button
							key={ shortcut.id || idx }
							onClick={ () => {
								onClick( shortcut );
							} }
						>
							{ shortcut.label }
							{ isSelectedShortcut( shortcut ) && <Icon icon={ check } /> }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DateControlPickerShortcuts;
