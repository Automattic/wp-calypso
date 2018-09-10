/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockControls, PlainText } from '@wordpress/editor';
import { Toolbar } from '@wordpress/components';
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
const MODE_CONTROLS = [
	{
		icon: 'editor-code',
		title: __( 'Markdown' ),
		mode: PANEL_EDITOR,
	},
	{
		icon: 'editor-kitchensink',
		title: __( 'Preview' ),
		mode: PANEL_PREVIEW,
	},
];

class JetpackMarkdownBlockEditor extends Component {
	constructor() {
		super( ...arguments );

		this.updateSource = this.updateSource.bind( this );
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

	toggleMode = mode => () => {
		this.setState( { activePanel: mode } );
	};

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
					<Toolbar
						controls={ MODE_CONTROLS.map( control => {
							const { icon, mode, title } = control;

							return {
								icon,
								isActive: this.state.activePanel === mode,
								onClick: this.toggleMode( mode ),
								title,
							};
						} ) }
					/>
				</BlockControls>
				{ editorOrPreviewPanel.call( this ) }
			</div>
		);
	}
}

export default JetpackMarkdownBlockEditor;
