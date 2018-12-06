/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { flow, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuItem, withSpokenMessages } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import shortcuts from '../../keyboard-shortcuts';

export function BlockInspectorButton( {
	areAdvancedSettingsOpened,
	closeSidebar,
	openEditorSidebar,
	onClick = noop,
	small = false,
	speak,
} ) {
	const speakMessage = () => {
		if ( areAdvancedSettingsOpened ) {
			speak( __( 'Block settings closed' ) );
		} else {
			speak( __( 'Additional settings are now available in the Editor block settings sidebar' ) );
		}
	};

	const label = areAdvancedSettingsOpened
		? __( 'Hide Block Settings' )
		: __( 'Show Block Settings' );

	return (
		<MenuItem
			className="editor-block-settings-menu__control"
			onClick={ flow(
				areAdvancedSettingsOpened ? closeSidebar : openEditorSidebar,
				speakMessage,
				onClick
			) }
			icon="admin-generic"
			label={ small ? label : undefined }
			shortcut={ shortcuts.toggleSidebar }
		>
			{ ! small && label }
		</MenuItem>
	);
}

export default compose(
	withSelect( select => ( {
		areAdvancedSettingsOpened:
			select( 'core/edit-post' ).getActiveGeneralSidebarName() === 'edit-post/block',
	} ) ),
	withDispatch( dispatch => ( {
		openEditorSidebar: () => dispatch( 'core/edit-post' ).openGeneralSidebar( 'edit-post/block' ),
		closeSidebar: dispatch( 'core/edit-post' ).closeGeneralSidebar,
	} ) ),
	withSpokenMessages
)( BlockInspectorButton );
