/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Editor from './edit-post/editor.js';

const editorSettings = {};
const overridePost = {};
const post = {
	type: 'post',
	content: {},
};

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
