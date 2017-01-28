/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import enhanceWithArrowControls from '../../lib/hoc-arrow-controls';
import { findText } from '../../lib/util';

class CodeBlock extends Component {
	static blockStyle = {
		margin: '8px 0',
		padding: '12px',
	};

	static innerStyle = {
		background: '#f3f6f8',
		border: 'none',
		boxShadow: 'none',
		fontFamily: 'monospace',
	};

	state = { content: findText( this.props ) };

	setContent = ( e ) => {
		this.setState( { content: e.target.value }, () => {
			this.props.dispatch( {
				type: 'update',
				id: this.props.id,
				serialized: this.serialize()
			} );
		} );
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
			<textarea style={ CodeBlock.innerStyle }
				onChange={ this.setContent }
				value={ this.state.content } />
		);
	}
}

export default enhanceWithArrowControls( CodeBlock );
