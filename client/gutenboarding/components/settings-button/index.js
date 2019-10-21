/**
 * External dependencies
 */
import React from 'react';
import { IconButton } from '@wordpress/components';
import shortcuts from '@wordpress/edit-post/build-module/keyboard-shortcuts';

export default function SettingsButton( { onClick, isToggled } ) {
	return (
		<IconButton
			icon="admin-generic"
			label={ 'Site Block Settings' }
			onClick={ onClick }
			isToggled={ isToggled }
			aria-expanded={ isToggled }
			shortcut={ shortcuts.toggleSidebar }
		/>
	);
}
