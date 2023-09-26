import { Button } from '@wordpress/components';
import React from 'react';
import { DateControlPickerShortcutsProps } from './types';

const DateControlPickerShortcuts = ( { shortcutList }: DateControlPickerShortcutsProps ) => {
	return (
		<div>
			{ shortcutList.map( ( shortcut, idx ) => (
				<Button key={ shortcut.id || idx } onClick={ shortcut.onClick }>
					{ shortcut.label }
				</Button>
			) ) }
		</div>
	);
};

export default DateControlPickerShortcuts;
