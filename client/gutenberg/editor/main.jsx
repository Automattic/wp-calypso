/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop } from 'lodash';
import {
	registerBlockType,
	setDefaultBlockName,
	setUnknownTypeHandlerName,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';
import * as paragraph from './core-blocks/paragraph';
import * as heading from './core-blocks/heading';

const editorSettings = {};
const overridePost = {};
const post = {
	type: 'post',
	content: {},
};

const registerCoreBlocks = () => {
	[ paragraph, heading ].forEach( ( { name, settings } ) => {
		registerBlockType( name, settings );
	} );

	setDefaultBlockName( paragraph.name );

	setUnknownTypeHandlerName( paragraph.name );
};

// Mock this call until core-blocks package is published
registerCoreBlocks();

class GutenbergEditor extends Component {
	render() {
		return (
			<Editor
				settings={ editorSettings }
				hasFixedToolbar={ true }
				post={ post }
				overridePost={ overridePost }
				onError={ noop }
			/>
		);
	}
}

export default GutenbergEditor;
