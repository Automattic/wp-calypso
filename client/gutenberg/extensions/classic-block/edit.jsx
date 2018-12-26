/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { Component } from '@wordpress/element';
import { debounce, noop } from 'lodash';
import TinyMCE from 'components/tinymce';

/**
 * WordPress dependencies
 */
import { withDispatch } from '@wordpress/data';

export class ClassicEdit extends Component {
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
		const { isSelected, setSelected } = this.props;
		return (
			<TinyMCE
				isGutenbergClassicBlock
				mode="tinymce"
				onChange={ this.debouncedOnContentChange }
				onClick={ isSelected ? noop : setSelected }
				onKeyUp={ this.debouncedOnContentChange }
				onSetContent={ this.debouncedOnContentChange }
				onTextEditorChange={ this.debouncedOnContentChange }
				ref={ this.storeEditor }
			/>
		);
	}
}

export default withDispatch( ( dispatch, { clientId } ) => ( {
	setSelected: () => dispatch( 'core/editor' ).selectBlock( clientId ),
} ) )( ClassicEdit );
