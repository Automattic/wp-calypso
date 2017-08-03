/**
 * External dependencies
 */
var React = require( 'react' ),
	map = require( 'lodash/map' );

module.exports = React.createClass( {
	displayName: 'ValidationErrorList',

	propTypes: {
		messages: React.PropTypes.array.isRequired
	},

	render: function() {
		return (
			<div>
				<p>
					{ this.translate(
						'Please correct the issue below and try again.',
						'Please correct the issues listed below and try again.',
						{
							count: this.props.messages.length
						}
					) }
				</p>
				<ul>
					{ map( this.props.messages, function( message, index ) {
						return ( <li key={ index }>{ message }</li> );
					} ) }
				</ul>
			</div>
		);
	}
} );
