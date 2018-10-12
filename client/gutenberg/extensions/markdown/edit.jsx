/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockControls, PlainText } from '@wordpress/editor';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import MarkdownRenderer from './renderer';

/**
 * Module variables
 */
const PANEL_EDITOR = 'editor';
const PANEL_PREVIEW = 'preview';

class MarkdownEdit extends Component {
	state = {
		activePanel: PANEL_EDITOR,
	};

	componentDidUpdate( prevProps ) {
		if (
			prevProps.isSelected &&
			! this.props.isSelected &&
			this.state.activePanel === PANEL_PREVIEW
		) {
			this.toggleMode( PANEL_EDITOR )();
		}
	}

	isEmpty() {
		const source = this.props.attributes.source;
		return ! source || source.trim() === '';
	}

	updateSource = source => this.props.setAttributes( { source } );

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
					{ __( 'Write your _Markdown_ **here**...', 'jetpack' ) }
				</p>
			);
		}

		return (
			<div className={ className }>
				<BlockControls>
					<div className="components-toolbar">
						{ this.renderToolbarButton( PANEL_EDITOR, __( 'Markdown', 'jetpack' ) ) }
						{ this.renderToolbarButton( PANEL_PREVIEW, __( 'Preview', 'jetpack' ) ) }
					</div>
				</BlockControls>

				{ activePanel === PANEL_PREVIEW || ! isSelected ? (
					<MarkdownRenderer className={ `${ className }__preview` } source={ source } />
				) : (
					<PlainText
						className={ `${ className }__editor` }
						onChange={ this.updateSource }
						aria-label={ __( 'Markdown', 'jetpack' ) }
						value={ source }
					/>
				) }
			</div>
		);
	}
}

export default MarkdownEdit;
