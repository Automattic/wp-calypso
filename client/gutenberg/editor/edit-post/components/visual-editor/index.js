/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	BlockList,
	CopyHandler,
	PostTitle,
	WritingFlow,
	ObserveTyping,
	EditorGlobalKeyboardShortcuts,
	BlockSelectionClearer,
	MultiSelectScrollIntoView,
	_BlockSettingsMenuFirstItem,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import BlockInspectorButton from './block-inspector-button';

function VisualEditor() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<BlockSelectionClearer className="edit-post-visual-editor">
			<EditorGlobalKeyboardShortcuts />
			<CopyHandler />
			<MultiSelectScrollIntoView />
			<WritingFlow>
				<ObserveTyping>
					<PostTitle />
					<BlockList />
				</ObserveTyping>
			</WritingFlow>
			<_BlockSettingsMenuFirstItem>
				{ ( { onClose } ) => <BlockInspectorButton onClick={ onClose } role="menuitem" /> }
			</_BlockSettingsMenuFirstItem>
		</BlockSelectionClearer>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default VisualEditor;
