/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import '@wordpress/data';
import '@wordpress/core-data';
import { registerCoreBlocks } from '@wordpress/core-blocks';
import { EditorProvider, WritingFlow, ObserveTyping, BlockList } from '@wordpress/editor';
import { makeLayout, render } from 'controller';

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

function Gutenberg() {
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

function gut( context, next ) {
	context.primary = <Gutenberg />;
	next();
}

export default function() {
	page( '/gutenberg/:site?/:post?', gut, makeLayout, render );
}
