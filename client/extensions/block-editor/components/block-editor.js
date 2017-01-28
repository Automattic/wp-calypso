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
import { parse, parseOne } from '../lib/post-parser';
import { reducer } from '../lib/editor-state';
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
		const blocks = parse( dummyPost );
		const rawBlocks = map( blocks, 'rawContent' );
		this.state = { blocks, rawBlocks };
	}

	/*
	 * Manually set `post_content`. This triggers a full new parse to rewrite
	 * blocks state. To be used when interacting directly with the raw
	 * `post_content`, similarly to TinyMCE's HTML mode.
	 */
	setContent = ( e ) => {
		const value = e.target.value;
		const blocks = parse( value );
		const rawBlocks = map( blocks, 'rawContent' );
		this.setState( {
			blocks,
			rawBlocks,
			// failsafe for rendering in case parsing fails
			postContent: ! blocks && value,
		} );
	}

	/*
	 * Commit changes to the blocks array. This triggers partial parses of
	 * blocks marked as dirty. This is the preferred method to update data.
	 */
	commit( blocks ) {
		const newBlocks = blocks.map( ( block ) => (
			block.isDirty
				? parseOne( block.rawContent )
				: block
		) );

		this.setState( {
			blocks: newBlocks,
			rawBlocks: map( newBlocks, 'rawContent' ),
			// failsafe for rendering in case parsing fails
			postContent: ! newBlocks && map( blocks, 'rawContent' ).join( '\n' ),
		} );
	}

	dispatch = ( action ) => {
		debug( 'dispatch', action );
		const blocks = reducer( this.state.blocks, action );
		this.commit( blocks );
	}

	handleBlock = ( block ) => {
		return renderBlock( { ...block, dispatch: this.dispatch } );
	}

	render() {
		const { blocks, postContent, rawBlocks } = this.state;

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
