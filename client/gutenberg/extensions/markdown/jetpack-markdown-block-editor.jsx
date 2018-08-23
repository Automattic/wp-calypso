/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { BlockControls, PlainText } from '@wordpress/editor';
import { ButtonGroup } from '@wordpress/components';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import MarkdownRenderer from './components/markdown-renderer';

/**
 * Module variables
 */
const PANEL_EDITOR = 'editor';
const PANEL_PREVIEW = 'preview';

class JetpackMarkdownBlockEditor extends Component {
	constructor() {
		super( ...arguments );

		this.updateSource = this.updateSource.bind( this );
		this.showEditor = this.showEditor.bind( this );
		this.showPreview = this.showPreview.bind( this );
		this.isEmpty = this.isEmpty.bind( this );

		this.state = {
			activePanel: PANEL_EDITOR,
		};
	}

	isEmpty() {
		const source = this.props.attributes.source;
		return ! source || source.trim() === '';
	}

	updateSource( source ) {
		this.props.setAttributes( { source } );
	}

	showEditor() {
		this.setState( { activePanel: 'editor' } );
	}

	showPreview() {
		this.setState( { activePanel: 'preview' } );
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

		// Manages css classes for each panel based on component's state
		const classesForPanel = function( panelName ) {
			return classNames( {
				'components-tab-button': true,
				'is-active': this.state.activePanel === panelName,
				[ `${ className }__${ panelName }-button` ]: true,
			} );
		};

		return (
			<div className={ className }>
				<BlockControls>
					<ButtonGroup>
						<button
							className={ classesForPanel.call( this, 'editor' ) }
							onClick={ this.showEditor }
						>
							<span>{ __( 'Markdown' ) }</span>
						</button>
						<button
							className={ classesForPanel.call( this, 'preview' ) }
							onClick={ this.showPreview }
						>
							<span>{ __( 'Preview' ) }</span>
						</button>
					</ButtonGroup>
				</BlockControls>
				{ editorOrPreviewPanel.call( this ) }
			</div>
		);
	}
}

export default JetpackMarkdownBlockEditor;
