/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	BlockList,
	WritingFlow,
	ObserveTyping,
	CopyHandler,
	Typewriter,
	BlockSelectionClearer,
} from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';

/**
 * This is a copy of packages/edit-post/src/components/visual-editor/index.js
 *
 * The original is not exported, and contains code for post titles
 */
const VisualEditor = () => (
	<BlockSelectionClearer>
		<Popover.Slot name="block-toolbar" />

		<Typewriter>
			<CopyHandler>
				<WritingFlow>
					<ObserveTyping>
						<BlockList />
					</ObserveTyping>
				</WritingFlow>
			</CopyHandler>
		</Typewriter>
	</BlockSelectionClearer>
);

export default VisualEditor;
