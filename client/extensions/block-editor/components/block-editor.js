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
import { findText, tryOr } from '../lib/util';
import { parse } from '../lib/post-parser';

const debug = debugFactory( 'calypso:block-editor:block-editor' );

export default class BlockEditor extends Component {
	static blockStyle = {
		background: 'white',
		border: '1px dashed black',
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
		this.setState( { blocks, rawBlocks } );
	}

	serialize() {
		return this.state.blocks.map( ( block ) => {

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

		return handleBlock( { ...block, update } );
	}

	render() {
		const { blocks, rawBlocks } = this.state;

		debug( 'blocks', blocks );

		return (
			<div>
				<h1 className="devdocs__title">Input</h1>
				<textarea onChange={ this.setContent } value={ rawBlocks.join( '\n' ) } />
				<h1 className="devdocs__title">Output</h1>
				<div style={ BlockEditor.blockStyle }>
					{ blocks
						? blocks.map( this.handleBlock )
						: <Notice status="is-error" showDismiss={ false }
							text="Parsing error" /> }
				</div>
			</div>
		);
	}
}

function handleBlock( block ) {
	if ( block.type === 'Text' ) {
		return <p>{ block.value }</p>;
	}

	if ( block.blockType === 'code' ) {
		return <CodeBlock { ...block } />;
	}

	if ( block.type === 'WP_Block' ) {
		return <Block { ...block } />;
	}

	return null;
}

class Block extends Component {
	static blockStyle = {
		margin: '0.2em',
		padding: '0.3em',
		border: '1px dashed black',
	};

	// fake impl
	innerText() {
		if ( this.props.type === 'Text' ) {
			return this.props.children
				.filter( c => c && c.type === 'Text' )
				.map( c => c.value )
				.join( '\n' );
		}

		return <div dangerouslySetInnerHTML={ {
			__html: this.props.rawContent
		} } />;
	}

	render() {
		debug( 'block', this.props );
		return <div style={ Block.blockStyle }>{ this.innerText() }</div>;
	}
}

class CodeBlock extends Component {
	static blockStyle = {
		background: '#f3f6f8',
		border: '1px dashed black',
		fontFamily: 'monospace',
		margin: '0.2em',
		padding: '0.3em',
	};

	state = { content: findText( this.props ) };

	setContent = ( e ) => {
		this.setState( { content: e.target.value }, () => {
			this.props.update( this.serialize() );
		} );
	}

	componentDidUpdate() {
		debug( 'CodeBlock', this.serialize() );
	}

	componentWillReceiveProps( nextProps ) {
		this.setState( { content: findText( nextProps ) } );
	}

	serialize() {
		return `
<!-- wp:code -->
<pre><code>${ this.state.content }</code></pre>
<!-- /wp -->`;
	}

	render() {
		return (
			<textarea style={ CodeBlock.blockStyle }
				onChange={ this.setContent }
				value={ this.state.content } />
		);
	}
}

