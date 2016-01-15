/**
 * External dependencies
 */
import React from 'react';

var debug = require( 'debug' )( 'calypso:textarea' );

const TextareaAutosize = React.createClass( {
	getInitialState() {
		return { rowCount: 1 };
	},

	handleChange( event ) {
		const textarea = event.target;
		this.setState( {
			rowCount: Math.ceil(
				( textarea.scrollHeight * this.state.rowCount ) / textarea.clientHeight
			)
		} );
	},

	render() {
		debug( 'rows' + this.state.rowCount );
		return (
			<textarea {...this.props} rows={ this.state.rowCount } onChange={ this.handleChange }></textarea>
		);
	}
} );

export default TextareaAutosize;
