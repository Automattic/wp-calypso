/**
 * External dependencies
 */
import '@wordpress/editor'; // This shouldn't be necessary
import { __ } from '@wordpress/i18n';
import {
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
} from '@wordpress/block-editor';
import {
	Popover,
	SlotFillProvider,
	DropZoneProvider,
	KeyboardShortcuts,
} from '@wordpress/components';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { rawShortcut, displayShortcut, shortcutAriaLabel } from '@wordpress/keycodes';
import '@wordpress/format-library';
import classnames from 'classnames';
import React, { useState } from 'react';
import { parse as parseBlocks } from '@wordpress/blocks';
import '@wordpress/components/build-style/style.css';

/**
 * FSE dependencies ???
 */
import TemplateSelectorControl from '../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal/components/template-selector-control';
import replacePlaceholders from '../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal/utils/replace-placeholders';

/**
 * Internal dependencies
 */
import Header from './components/header';
import { name, settings } from './onboarding-block';
import { Slot as SidebarSlot } from './components/sidebar';
import SettingsSidebar from './components/settings-sidebar';
import './stores/domain-suggestions';
import './stores/onboard';
import './stores/verticals-templates';
import './style.scss';
import { useSelect } from '@wordpress/data';

// Copied from https://github.com/WordPress/gutenberg/blob/c7d00c64a4c74236a4aab528b3987811ab928deb/packages/edit-post/src/keyboard-shortcuts.js#L11-L15
// to be consistent with Gutenberg's shortcuts, and in order to avoid pulling in all of `@wordpress/edit-post`.
const toggleSidebarShortcut = {
	raw: rawShortcut.primaryShift( ',' ),
	display: displayShortcut.primaryShift( ',' ),
	ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
};

registerBlockType( name, settings );

const onboardingBlock = createBlock( name, {} );

export function Gutenboard() {
	const [ isEditorSidebarOpened, updateIsEditorSidebarOpened ] = useState( false );

	const toggleGeneralSidebar = () => updateIsEditorSidebarOpened( isOpen => ! isOpen );

	const templates = useSelect( select =>
		select( 'automattic/verticals/templates' ).getTemplates( 'p13v1' )
	);

	// Parse templates blocks and store them into the state.
	const blocksByTemplateSlug = templates?.reduce( ( prev, { slug, content } ) => {
		prev[ slug ] = content ? parseBlocks( replacePlaceholders( content ) ) : [];
		return prev;
	}, {} );

	const [ previewedTemplate, setPreviewedTemplate ] = useState< string | null >( null );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor__container">
			<h3>previewing: { previewedTemplate }</h3>
			<TemplateSelectorControl
				label={ __( 'Layout', 'full-site-editing' ) }
				templates={ templates ?? [] }
				blocksByTemplates={ blocksByTemplateSlug }
				onTemplateSelect={ setPreviewedTemplate }
				useDynamicPreview={ false }
				siteInformation={ undefined }
				selectedTemplate={ previewedTemplate }
				// handleTemplateConfirmation={ this.handleConfirmation }
			/>
			<Popover.Slot />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
