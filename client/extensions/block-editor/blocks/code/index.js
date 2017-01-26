/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { findText } from '../../lib/util';

const debug = debugFactory( 'calypso:block-editor:code' );

export default class CodeBlock extends Component {
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
