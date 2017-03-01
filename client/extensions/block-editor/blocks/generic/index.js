/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import TinyMCE from 'components/tinymce';
import enhanceWithArrowControls from '../../lib/hoc-arrow-controls';

class GenericBlock extends Component {
	static blockStyle = {
		margin: '8px 0',
		padding: '12px',
	};

	componentDidUpdate() {
		if ( this.props.isSelected &&
				! this.refs.editor.getContent() ) {
			this.refs.editor.setEditorContent(
					this.getText(), { initial: true } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isSelected &&
				! nextProps.isSelected ) {
			this.props.dispatch( {
				type: 'update',
				id: this.props.id,
				serialized: this.serialized(),
			} );
		}
	}

	// fake impl
	innerText() {
		return this.props.children
			.filter( c => c && c.type === 'Text' )
			.map( c => c.value )
			.join( '\n' );
	}

	getText( wrapped = false ) {
		if ( this.props.type === 'Text' ) {
			return this.innerText();
		}

		const { startText, endText, rawContent } = this.props;
		const start = rawContent.indexOf( startText ) + startText.length;
		const end = rawContent.indexOf( endText, -1 );
		const text = rawContent.slice( start, end );

		return wrapped
			? <div dangerouslySetInnerHTML={ {
				__html: text
			} } />
			: text;
	}

	serialized() {
		const { startText, endText } = this.props;
		const raw = this.refs.editor.getContent( { format: 'raw' } );
		return startText + raw + endText;
	}

	render() {
		return (
			<div>
				{ this.props.type !== 'Text' && this.props.isSelected
					? <TinyMCE ref="editor" />
					: this.getText( true )
				}
			</div>
		);
	}
}

export default enhanceWithArrowControls( GenericBlock );
