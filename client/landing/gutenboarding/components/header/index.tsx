/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, IconButton } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import React from 'react';
import shortcuts from '@wordpress/edit-post/build-module/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../store';
import './style.scss';

interface Props {
	isEditorSidebarOpened: boolean;
	toggleGeneralSidebar: () => void;
}

export default function Header( { isEditorSidebarOpened, toggleGeneralSidebar }: Props ) {
	const { siteTitle, siteType } = useSelect( select => select( STORE_KEY ).getState() );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<div>
				<p>
					You have a: { siteType }!
					{ siteTitle && (
						<>
							<br />
							It's called <em>{ siteTitle }</em>!
						</>
					) }
				</p>
			</div>
			<div
				aria-label={ NO__( 'Document tools' ) }
				aria-orientation="horizontal"
				className="gutenboarding__header-toolbar"
				role="toolbar"
			></div>
			<div className="gutenboarding__header-actions">
				<Button isPrimary isLarge>
					{ NO__( 'Continue' ) }
				</Button>
				<IconButton
					icon="admin-generic"
					label={ NO__( 'Site block settings' ) }
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
