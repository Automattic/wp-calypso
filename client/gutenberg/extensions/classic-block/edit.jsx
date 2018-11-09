/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Component } from '@wordpress/element';
import { debounce } from 'lodash';
import TinyMCE from 'components/tinymce';

export default class ClassicEdit extends Component {
	componentDidMount() {
		const { attributes } = this.props;
		const { content } = attributes;

		if ( this.editor && content ) {
			this.editor.setEditorContent( content );
		}
	}

	storeEditor = ref => {
		this.editor = ref;
	};

	debouncedOnContentChange = debounce( () => {
		const rawContent = this.editor.getContent( { format: 'raw' } );

		this.props.setAttributes( { content: rawContent } );
	}, 300 );

	render() {
		return (
			<TinyMCE
				mode="tinymce"
				ref={ this.storeEditor }
				onChange={ this.debouncedOnContentChange }
				onSetContent={ this.debouncedOnContentChange }
				onTextEditorChange={ this.debouncedOnContentChange }
				onKeyUp={ this.debouncedOnContentChange }
			/>
		);
	}
}
