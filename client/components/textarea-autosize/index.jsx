/**
 * External dependencies
 */
import React from 'react';

var debug = require( 'debug' )( 'calypso:textarea' );

const TextareaAutosize = React.createClass( {
	getInitialState() {
		return { textareaHeight: null };
	},

	handleChange( event ) {
		const textarea = event.target;

		if ( textarea.scrollHeight > textarea.clientHeight ) {
			this.setState( {
				textareaHeight: textarea.scrollHeight + 'px'
			} );
		}
	},

	render() {
		debug( 'rows' + this.state.textareaHeight );

		const style = this.state.textareaHeight ? { height: this.state.textareaHeight } : null;
		return (
			<textarea {...this.props} style={ style } onChange={ this.handleChange }></textarea>
		);
	}
} );

export default TextareaAutosize;
