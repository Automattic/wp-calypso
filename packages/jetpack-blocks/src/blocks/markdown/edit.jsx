/**
 * External dependencies
 */
import { BlockControls, PlainText } from '@wordpress/editor';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import MarkdownRenderer from './renderer';
import { __ } from '../../utils/i18n';

/**
 * Module variables
 */
const PANEL_EDITOR = 'editor';
const PANEL_PREVIEW = 'preview';

class MarkdownEdit extends Component {
	input = null;

	state = {
		activePanel: PANEL_EDITOR,
	};

	bindInput = ref => void ( this.input = ref );

	componentDidUpdate( prevProps ) {
		if (
			prevProps.isSelected &&
			! this.props.isSelected &&
			this.state.activePanel === PANEL_PREVIEW
		) {
			this.toggleMode( PANEL_EDITOR )();
		}
		if (
			! prevProps.isSelected &&
			this.props.isSelected &&
			this.state.activePanel === PANEL_EDITOR &&
			this.input
		) {
			this.input.focus();
		}
	}

	isEmpty() {
		const source = this.props.attributes.source;
		return ! source || source.trim() === '';
	}

	updateSource = source => this.props.setAttributes( { source } );

	handleKeyDown = e => {
		const { attributes, removeBlock } = this.props;
		const { source } = attributes;

		// Remove the block if source is empty and we're pressing the Backspace key
		if ( e.keyCode === 8 && source === '' ) {
			removeBlock();
			e.preventDefault();
		}
	};

	toggleMode = mode => () => this.setState( { activePanel: mode } );

	renderToolbarButton( mode, label ) {
		const { activePanel } = this.state;

		return (
			<button
				className={ `components-tab-button ${ activePanel === mode ? 'is-active' : '' }` }
				onClick={ this.toggleMode( mode ) }
			>
				<span>{ label }</span>
			</button>
		);
	}

	render() {
		const { attributes, className, isSelected } = this.props;
		const { source } = attributes;
		const { activePanel } = this.state;

		if ( ! isSelected && this.isEmpty() ) {
			return (
				<p className={ `${ className }__placeholder` }>
					{ __( 'Write your _Markdown_ **here**…' ) }
				</p>
			);
		}

		return (
			<div className={ className }>
				<BlockControls>
					<div className="components-toolbar">
						{ this.renderToolbarButton( PANEL_EDITOR, __( 'Markdown' ) ) }
						{ this.renderToolbarButton( PANEL_PREVIEW, __( 'Preview' ) ) }
					</div>
				</BlockControls>

				{ activePanel === PANEL_PREVIEW || ! isSelected ? (
					<MarkdownRenderer className={ `${ className }__preview` } source={ source } />
				) : (
					<PlainText
						className={ `${ className }__editor` }
						onChange={ this.updateSource }
						onKeyDown={ this.handleKeyDown }
						aria-label={ __( 'Markdown' ) }
						innerRef={ this.bindInput }
						value={ source }
					/>
				) }
			</div>
		);
	}
}

export default compose( [
	withSelect( select => ( {
		currentBlockId: select( 'core/editor' ).getSelectedBlockClientId(),
	} ) ),
	withDispatch( ( dispatch, { currentBlockId } ) => ( {
		removeBlock: () => dispatch( 'core/editor' ).removeBlocks( currentBlockId ),
	} ) ),
] )( MarkdownEdit );
