/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { PostPreviewButton, PostSavedState } from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { DotTip } from '@wordpress/nux';

/**
 * Internal dependencies
 */
import MoreMenu from './more-menu';
import HeaderToolbar from './header-toolbar';
import PinnedPlugins from './pinned-plugins';
import shortcuts from '../../keyboard-shortcuts';
import PostPublishButtonOrToggle from './post-publish-button-or-toggle';

function Header( {
	closeGeneralSidebar,
	isEditorSidebarOpened,
	isPublishSidebarOpened,
	openGeneralSidebar,
} ) {
	const toggleGeneralSidebar = isEditorSidebarOpened ? closeGeneralSidebar : openGeneralSidebar;

	return (
		<div
			role="region"
			/* translators: accessibility text for the top bar landmark region. */
			aria-label={ __( 'Editor top bar' ) }
			className="edit-post-header"
			tabIndex="-1"
		>
			<HeaderToolbar />
			{ ! isPublishSidebarOpened && (
				<div className="edit-post-header__settings">
					<PostSavedState />
					<PostPreviewButton />
					<PostPublishButtonOrToggle />
					<div>
						<IconButton
							icon="admin-generic"
							label={ __( 'Settings' ) }
							onClick={ toggleGeneralSidebar }
							isToggled={ isEditorSidebarOpened }
							aria-expanded={ isEditorSidebarOpened }
							shortcut={ shortcuts.toggleSidebar }
						/>
						<DotTip tipId="core/editor.settings">
							{ __(
								'You’ll find more settings for your page and blocks in the sidebar. Click “Settings” to open it.'
							) }
						</DotTip>
					</div>
					<PinnedPlugins.Slot />
					<MoreMenu />
				</div>
			) }
		</div>
	);
}

export default compose(
	withSelect( select => ( {
		hasBlockSelection: !! select( 'core/editor' ).getBlockSelectionStart(),
		isEditorSidebarOpened: select( 'core/edit-post' ).isEditorSidebarOpened(),
		isPublishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
	} ) ),
	withDispatch( ( dispatch, { hasBlockSelection } ) => {
		const { openGeneralSidebar, closeGeneralSidebar } = dispatch( 'core/edit-post' );
		const sidebarToOpen = hasBlockSelection ? 'edit-post/block' : 'edit-post/document';
		return {
			openGeneralSidebar: () => openGeneralSidebar( sidebarToOpen ),
			closeGeneralSidebar: closeGeneralSidebar,
			hasBlockSelection: undefined,
		};
	} )
)( Header );
