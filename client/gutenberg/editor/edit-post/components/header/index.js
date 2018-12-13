/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { PostSavedState } from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import MoreMenu from './more-menu';
import HeaderToolbar from 'gutenberg/editor/components/header/header-toolbar'; // GUTENLYPSO
import PostPreviewButton from 'gutenberg/editor/components/post-preview-button'; // GUTENLYPSO
import PinnedPlugins from './pinned-plugins';
import shortcuts from '../../keyboard-shortcuts';
import PostPublishButtonOrToggle from './post-publish-button-or-toggle';

function Header( {
	closeGeneralSidebar,
	hasActiveMetaboxes,
	isEditorSidebarOpened,
	isPublishSidebarOpened,
	isSaving,
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
			<div className="edit-post-header__settings">
				{ ! isPublishSidebarOpened && (
					// This button isn't completely hidden by the publish sidebar.
					// We can't hide the whole toolbar when the publish sidebar is open because
					// we want to prevent mounting/unmounting the PostPublishButtonOrToggle DOM node.
					// We track that DOM node to return focus to the PostPublishButtonOrToggle
					// when the publish sidebar has been closed.
					<PostSavedState forceIsDirty={ hasActiveMetaboxes } forceIsSaving={ isSaving } />
				) }
				<PostPreviewButton />
				<PostPublishButtonOrToggle forceIsDirty={ hasActiveMetaboxes } forceIsSaving={ isSaving } />
				<div>
					<IconButton
						icon="admin-generic"
						label={ __( 'Settings' ) }
						onClick={ toggleGeneralSidebar }
						isToggled={ isEditorSidebarOpened }
						aria-expanded={ isEditorSidebarOpened }
						shortcut={ shortcuts.toggleSidebar }
					/>
				</div>
				<PinnedPlugins.Slot />
				<MoreMenu />
			</div>
		</div>
	);
}

export default compose(
	withSelect( select => ( {
		hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
		hasBlockSelection: !! select( 'core/editor' ).getBlockSelectionStart(),
		isEditorSidebarOpened: select( 'core/edit-post' ).isEditorSidebarOpened(),
		isPublishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
		isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
	} ) ),
	withDispatch( ( dispatch, { hasBlockSelection } ) => {
		const { openGeneralSidebar, closeGeneralSidebar } = dispatch( 'core/edit-post' );
		const sidebarToOpen = hasBlockSelection ? 'edit-post/block' : 'edit-post/document';

		return {
			openGeneralSidebar: () => openGeneralSidebar( sidebarToOpen ),
			closeGeneralSidebar: closeGeneralSidebar,
		};
	} )
)( Header );
