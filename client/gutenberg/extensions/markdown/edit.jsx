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

/* eslint-disable wpcalypso/jsx-classname-namespace */
class JetpackMarkdownBlockEditor extends Component {
	state = {
		activePanel: PANEL_EDITOR,
	};

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

		if ( ! isSelected && this.isEmpty() ) {
			return (
				<p className={ `${ className }__placeholder` }>
					{ __( 'Write your _Markdown_ **here**...' ) }
				</p>
			);
		}

		// Renders the editor panel or the preview panel based on component's state
		const editorOrPreviewPanel = function() {
			const source = attributes.source;

			switch ( this.state.activePanel ) {
				case PANEL_EDITOR:
					return (
						<PlainText
							className={ `${ className }__editor` }
							onChange={ this.updateSource }
							aria-label={ __( 'Markdown' ) }
							value={ attributes.source }
						/>
					);

				case PANEL_PREVIEW:
					return <MarkdownRenderer className={ `${ className }__preview` } source={ source } />;
			}
		};

		return (
			<div className={ className }>
				<BlockControls>
					<div className="components-toolbar">
						{ this.renderToolbarButton( PANEL_EDITOR, __( 'Markdown' ) ) }
						{ this.renderToolbarButton( PANEL_PREVIEW, __( 'Preview' ) ) }
					</div>
				</BlockControls>
				{ editorOrPreviewPanel.call( this ) }
			</div>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default JetpackMarkdownBlockEditor;
