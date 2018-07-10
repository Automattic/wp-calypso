
/**
 * External Dependencies
 */
import TextareaAutosize from 'react-autosize-textarea';
import { isEqual } from 'lodash';

/**
 * WordPress Dependencies
 */
import { Component, compose } from '@wordpress/element';
import { getBlockAttributes, getBlockContent, getBlockType, isValidBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';

class BlockHTML extends Component {
	constructor( props ) {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.onBlur = this.onBlur.bind( this );
		this.state = {
			html: props.block.isValid ? getBlockContent( props.block ) : props.block.originalContent,
		};
	}

	componentDidUpdate( prevProps ) {
		if ( ! isEqual( this.props.block.attributes, prevProps.block.attributes ) ) {
			this.setState( {
				html: getBlockContent( this.props.block ),
			} );
		}
	}

	onBlur() {
		const blockType = getBlockType( this.props.block.name );
		const attributes = getBlockAttributes( blockType, this.state.html, this.props.block.attributes );
		const isValid = isValidBlock( this.state.html, blockType, attributes );
		this.props.onChange( this.props.uid, attributes, this.state.html, isValid );
	}

	onChange( event ) {
		this.setState( { html: event.target.value } );
	}

	render() {
		const { html } = this.state;
		return (
			<TextareaAutosize
				className="editor-block-list__block-html-textarea"
				value={ html }
				onBlur={ this.onBlur }
				onChange={ this.onChange }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => ( {
		block: select( 'core/editor' ).getBlock( ownProps.uid ),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		onChange( uid, attributes, originalContent, isValid ) {
			dispatch( 'core/editor' ).updateBlock( uid, { attributes, originalContent, isValid } );
		},
	} ) ),
] )( BlockHTML );
