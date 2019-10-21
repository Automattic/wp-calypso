/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, IconButton } from '@wordpress/components';
import React from 'react';
import shortcuts from '@wordpress/edit-post/build-module/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	isEditorSidebarOpened: boolean;
	toggleGeneralSidebar: () => void;
}

export function Header( { isEditorSidebarOpened, toggleGeneralSidebar }: Props ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex="-1"
		>
			<div
				aria-label={ __( 'Document tools' ) }
				aria-orientation="horizontal"
				className="gutenboarding__header-toolbar"
				role="toolbar"
			></div>
			<div className="gutenboarding__header-actions">
				<Button isPrimary isLarge>
					{ __( 'Continue' ) }
				</Button>
				<IconButton
					icon="admin-generic"
					label={ 'Site Block Settings' }
					onClick={ toggleGeneralSidebar }
					isToggled={ isEditorSidebarOpened }
					aria-expanded={ isEditorSidebarOpened }
					shortcut={ shortcuts.toggleSidebar }
				/>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
