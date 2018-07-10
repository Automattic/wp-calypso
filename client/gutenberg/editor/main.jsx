/** @format */

/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import '@wordpress/data';
import '@wordpress/core-data';
import { registerCoreBlocks } from '@wordpress/core-blocks';
import { EditorProvider, WritingFlow, ObserveTyping, BlockList } from '@wordpress/editor';

const editorSettings = {};
const wpApiSettings = {
	schema: {
		routes: {},
	},
};
const post = {
	type: 'post',
	content: {},
};

registerCoreBlocks();

class GutenbergEditor extends Component {
	render() {
		return (
			<EditorProvider settings={ editorSettings } wpApiSettings={ wpApiSettings } post={ post }>
				<WritingFlow>
					<ObserveTyping>
						<BlockList />
					</ObserveTyping>
				</WritingFlow>
			</EditorProvider>
		);
	}
}

export default GutenbergEditor;
