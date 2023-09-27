import { Button } from '@wordpress/components';
import React from 'react';
import { DateControlPickerShortcutsProps } from './types';

const DateControlPickerShortcuts = ( {
	shortcutList,
	onClick,
}: DateControlPickerShortcutsProps ) => {
	return (
		<div>
			{ shortcutList.map( ( shortcut, idx ) => (
				<Button
					key={ shortcut.id || idx }
					onClick={ () => {
						onClick( shortcut );
					} }
				>
					{ shortcut.label }
				</Button>
			) ) }
		</div>
	);
};

export default DateControlPickerShortcuts;
