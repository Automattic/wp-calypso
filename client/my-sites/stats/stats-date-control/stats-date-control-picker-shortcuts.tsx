import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
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
					<li className="date-control-picker-shortcuts__shortcut" key={ shortcut.id || idx }>
						<Button
							key={ shortcut.id || idx }
							onClick={ () => {
								onClick( shortcut );
							} }
						>
							{ shortcut.label }
							<Icon className="gridicon" icon={ check } />
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DateControlPickerShortcuts;
