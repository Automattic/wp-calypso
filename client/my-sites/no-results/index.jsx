/**
 * External dependencies
 */
import React from 'react';

var noResults = React.createClass( {

	getDefaultProps: function() {
		return {
			text: 'No results',
			image: false
		};
	},

	render: function() {
		return (
			<div className="no-results">
				{ this.props.image ? <img className="no-results__img" src={ this.props.image } /> : null }
				<span>{ this.props.text }</span>
			</div>
		);
	}
} );

module.exports = noResults;
