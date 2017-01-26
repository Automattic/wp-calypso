/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { dummyPost } from '../fixtures';
import { tryOr } from '../lib/util';
import { parse } from '../lib/post-parser';
import { renderBlock } from '../blocks';

const debug = debugFactory( 'calypso:block-editor:block-editor' );

export default class BlockEditor extends Component {
	static blockStyle = {
		background: 'white',
		margin: '0.2em',
		padding: '0.3em',
	};

	constructor() {
		super();
		const blocks = tryOr( () => parse( dummyPost ), false );
		const rawBlocks = map( blocks, 'rawContent' );
		this.state = { blocks, rawBlocks };
	}

	setContent = ( e ) => {
		const value = e.target.value;
		const blocks = tryOr( () => parse( value ), false );
		const rawBlocks = map( blocks, 'rawContent' );
		this.setState( {
			blocks,
			rawBlocks,
			// failsafe for rendering in case parsing fails
			postContent: ! blocks && value,
		} );
	}

	handleBlock = ( block, i ) => {
		const update = ( serialized ) => {
			debug( 'update', serialized );
			const newRawBlocks = [ ...this.state.rawBlocks ];
			newRawBlocks[ i ] = serialized;
			const fakeEvent = { target: { value: newRawBlocks.join( '\n' ) } };
			this.setContent( fakeEvent );
		};

		return renderBlock( { ...block, update } );
	}

	render() {
		const { blocks, postContent, rawBlocks } = this.state;

		debug( 'blocks', blocks );

		return (
			<div>
				<h1 className="devdocs__title">Input</h1>
				<textarea className="block-editor__input" onChange={ this.setContent }
					value={ postContent || rawBlocks.join( '\n' ) } />

				<h1 className="devdocs__title">Output</h1>
				<div className="block-editor__output" style={ BlockEditor.blockStyle }>
					{ blocks
						? blocks.map( this.handleBlock )
						: <Notice status="is-error"
							showDismiss={ false }
							text="Parsing error" /> }
				</div>
			</div>
		);
	}
}
