/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button, Popover, ScrollLock, navigateRegions } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	AutosaveMonitor,
	UnsavedChangesWarning,
	EditorNotices,
	PostPublishPanel,
	PreserveScrollInReorder,
} from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { PluginArea } from '@wordpress/plugins';
import { withViewportMatch } from '@wordpress/viewport';
import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';
import { PluginPostPublishPanel, PluginPrePublishPanel } from '@wordpress/edit-post'; // GUTENLYPSO

/**
 * Internal dependencies
 */
import BrowserURL from 'gutenberg/editor/browser-url'; // GUTENLYPSO
import Header from '../header';
import TextEditor from '../text-editor';
import VisualEditor from '../visual-editor';
import EditorModeKeyboardShortcuts from '../keyboard-shortcuts';
import KeyboardShortcutHelpModal from '../keyboard-shortcut-help-modal';
import OptionsModal from '../options-modal';
import MetaBoxes from '../meta-boxes';
import SettingsSidebar from '../sidebar/settings-sidebar';
import Sidebar from '../sidebar';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

function Layout( {
	mode,
	editorSidebarOpened,
	pluginSidebarOpened,
	publishSidebarOpened,
	hasFixedToolbar,
	closePublishSidebar,
	togglePublishSidebar,
	hasActiveMetaboxes,
	isSaving,
	isMobileViewport,
	isRichEditingEnabled,
	// GUTENLYPSO START
	updatePost,
	resetBlocks,
	post,
	// GUTENLYPSO END
} ) {
	const sidebarIsOpened = editorSidebarOpened || pluginSidebarOpened || publishSidebarOpened;

	const className = classnames( 'edit-post-layout', {
		'is-sidebar-opened': sidebarIsOpened,
		'has-fixed-toolbar': hasFixedToolbar,
	} );

	const publishLandmarkProps = {
		role: 'region',
		/* translators: accessibility text for the publish landmark region. */
		'aria-label': __( 'Editor publish' ),
		tabIndex: -1,
	};

	// GUTENLYPSO START
	const loadRevision = revision => {
		const { post_content: content, post_title: title, post_excerpt: excerpt } = revision;
		const postRevision = { ...post, content, title, excerpt };
		//update post does not automatically update content/blocks intentionally
		updatePost( postRevision );
		const blocks = parse( content );
		resetBlocks( blocks );
	};
	// GUTENLYPSO END

	return (
		<div className={ className }>
			<BrowserURL />
			<UnsavedChangesWarning />
			<AutosaveMonitor />
			<Header />
			<div
				className="edit-post-layout__content"
				role="region"
				/* translators: accessibility text for the content landmark region. */
				aria-label={ __( 'Editor content' ) }
				tabIndex="-1"
			>
				<EditorNotices />
				<PreserveScrollInReorder />
				<EditorModeKeyboardShortcuts />
				<KeyboardShortcutHelpModal />
				<OptionsModal />
				{ ( mode === 'text' || ! isRichEditingEnabled ) && <TextEditor /> }
				{ isRichEditingEnabled && mode === 'visual' && <VisualEditor /> }
				<div className="edit-post-layout__metaboxes">
					<MetaBoxes location="normal" />
				</div>
				<div className="edit-post-layout__metaboxes">
					<MetaBoxes location="advanced" />
				</div>
			</div>
			<EditorRevisionsDialog loadRevision={ loadRevision } /> { /* GUTENLYPSO */ }
			{ publishSidebarOpened ? (
				<PostPublishPanel
					{ ...publishLandmarkProps }
					onClose={ closePublishSidebar }
					forceIsDirty={ hasActiveMetaboxes }
					forceIsSaving={ isSaving }
					PrePublishExtension={ PluginPrePublishPanel.Slot }
					PostPublishExtension={ PluginPostPublishPanel.Slot }
				/>
			) : (
				<Fragment>
					<div className="edit-post-toggle-publish-panel" { ...publishLandmarkProps }>
						<Button
							isDefault
							type="button"
							className="edit-post-toggle-publish-panel__button"
							onClick={ togglePublishSidebar }
							aria-expanded={ false }
						>
							{ __( 'Open publish panel' ) }
						</Button>
					</div>
					<SettingsSidebar />
					<Sidebar.Slot />
					{ isMobileViewport && sidebarIsOpened && <ScrollLock /> }
				</Fragment>
			) }
			<Popover.Slot />
			<PluginArea />
		</div>
	);
}

export default compose(
	withSelect( select => ( {
		post: select( 'core/editor' ).getCurrentPost(), // GUTENLYPSO
		mode: select( 'core/edit-post' ).getEditorMode(),
		editorSidebarOpened: select( 'core/edit-post' ).isEditorSidebarOpened(),
		pluginSidebarOpened: select( 'core/edit-post' ).isPluginSidebarOpened(),
		publishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
		hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
		hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
		isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
		isRichEditingEnabled: select( 'core/editor' ).getEditorSettings().richEditingEnabled,
	} ) ),
	withDispatch( dispatch => {
		const { updatePost, resetBlocks } = dispatch( 'core/editor' ); // GUTENLYPSO
		const { closePublishSidebar, togglePublishSidebar } = dispatch( 'core/edit-post' );
		return {
			closePublishSidebar,
			togglePublishSidebar,
			updatePost, // GUTENLYPSO
			resetBlocks, // GUTENLYPSO
		};
	} ),
	navigateRegions,
	withViewportMatch( { isMobileViewport: '< small' } )
)( Layout );
