/**
 * External dependencies
 */
import Textarea from 'react-autosize-textarea';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';
import { parse, serialize } from '@wordpress/blocks';

export class PostTextEditor extends Component {
	constructor() {
		super( ...arguments );

		this.edit = this.edit.bind( this );
		this.stopEditing = this.stopEditing.bind( this );

		this.state = {};
	}

	static getDerivedStateFromProps( props, state ) {
		if ( state.isDirty ) {
			return null;
		}

		return {
			value: props.value,
			isDirty: false,
		};
	}

	/**
	 * Handles a textarea change event to notify the onChange prop callback and
	 * reflect the new value in the component's own state. This marks the start
	 * of the user's edits, if not already changed, preventing future props
	 * changes to value from replacing the rendered value. This is expected to
	 * be followed by a reset to dirty state via `stopEditing`.
	 *
	 * @see stopEditing
	 *
	 * @param {Event} event Change event.
	 */
	edit( event ) {
		const value = event.target.value;
		this.props.onChange( value );
		this.setState( { value, isDirty: true } );
	}

	/**
	 * Function called when the user has completed their edits, responsible for
	 * ensuring that changes, if made, are surfaced to the onPersist prop
	 * callback and resetting dirty state.
	 */
	stopEditing() {
		if ( this.state.isDirty ) {
			this.props.onPersist( this.state.value );
			this.setState( { isDirty: false } );
		}
	}

	render() {
		const { value } = this.state;
		const { instanceId } = this.props;
		return (
			<>
				<label htmlFor={ `post-content-${ instanceId }` } className="screen-reader-text">
					{ __( 'Type text or HTML' ) }
				</label>
				<Textarea
					autoComplete="off"
					dir="auto"
					value={ value }
					onChange={ this.edit }
					onBlur={ this.stopEditing }
					className="editor-post-text-editor"
					id={ `post-content-${ instanceId }` }
					placeholder={ __( 'Start writing with text or HTML' ) }
				/>
			</>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const { getBlocks } = select( 'isolated/editor' );
		return {
			value: serialize( getBlocks() ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { updateBlocksWithoutUndo } = dispatch( 'isolated/editor' );
		return {
			onChange( content ) {
				const blocks = parse( content );
				updateBlocksWithoutUndo( blocks );
			},
			onPersist( content ) {
				const blocks = parse( content );
				updateBlocksWithoutUndo( blocks );
			},
		};
	} ),
	withInstanceId,
] )( PostTextEditor );
