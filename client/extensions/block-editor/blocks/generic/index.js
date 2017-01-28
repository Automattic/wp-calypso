/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import enhanceWithArrowControls from '../../lib/hoc-arrow-controls';

class GenericBlock extends Component {
	static blockStyle = {
		margin: '8px 0',
		padding: '12px',
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
		return this.innerText();
	}
}

export default enhanceWithArrowControls( GenericBlock );
