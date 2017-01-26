/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:block-editor:generic' );

export default class GenericBlock extends Component {
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
		return <div style={ GenericBlock.blockStyle }>{ this.innerText() }</div>;
	}
}
