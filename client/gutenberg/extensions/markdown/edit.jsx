/** @format */

/**
 * External dependencies
 */
import React from 'react';
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
					{ __( 'Write your _Markdown_ **here**...' ) }
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

				{ activePanel === PANEL_PREVIEW ? (
					<MarkdownRenderer className={ `${ className }__preview` } source={ source } />
				) : (
					<PlainText
						className={ `${ className }__editor` }
						onChange={ this.updateSource }
						aria-label={ __( 'Markdown' ) }
						value={ source }
					/>
				) }
			</div>
		);
	}
}

export default MarkdownEdit;
