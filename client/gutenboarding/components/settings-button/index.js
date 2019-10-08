/**
 * WordPress dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { IconButton } from '@wordpress/components';

/**
 * Internal dependencies
 */

/* eslint-disable no-restricted-syntax */
import shortcuts from '@wordpress/edit-post/build-module/keyboard-shortcuts';
/* eslint-enable no-restricted-syntax */

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