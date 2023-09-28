import { Button } from '@wordpress/components';
import React from 'react';
import { DateControlPickerShortcutsProps } from './types';

const DateControlPickerShortcuts = ( {
	shortcutList,
	onClick,
}: DateControlPickerShortcutsProps ) => {
	return (
		<div className="date-control-picker-shortcuts">
			<ul className="date-control-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => (
					<li className="date-control-picker-shortcuts__shortcut">
						<Button
							key={ shortcut.id || idx }
							onClick={ () => {
								onClick( shortcut );
							} }
						>
							{ shortcut.label }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DateControlPickerShortcuts;
