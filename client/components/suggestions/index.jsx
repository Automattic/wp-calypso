/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const Suggestions = React.createClass( {

	propTypes: {
		terms: React.PropTypes.object,
		input: React.PropTypes.string
	},

	componentDidMount: function() {
	},

	componentDidUpdate: function() {
	},

	render() {

		return (
			<div className="suggestions">
				<Card >
					<div>{ this.props.input }</div>
				</Card>
			</div>
			);
	}

} );

module.exports = Suggestions;
