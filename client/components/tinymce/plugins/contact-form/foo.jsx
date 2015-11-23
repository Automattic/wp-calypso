/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import noop from 'lodash/utility/noop';

export default React.createClass( {
	displayName: 'TinyMCEDropZone',

	getInitialState() {
		return {
			counter: 0
		}
	},

	render() {
		console.log('this is foo rendering');
		return (
			<div>
				<p>{ this.state.counter }</p>
				<button onClick={ () => this.setState( { counter: this.state.counter + 1 } ) }>Add</button>
			</div>
		);
	}
} );
