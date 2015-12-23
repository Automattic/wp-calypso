var React = require( 'react' );

module.exports = React.createClass( {
	render: function() {
		return React.createElement(
			'div',
			this.translate( '\'Start: %s\'' + '"Continuation, with quotes": %s',
				{
					args: [ '1', '2' ]
				} ) );
	}
} );
