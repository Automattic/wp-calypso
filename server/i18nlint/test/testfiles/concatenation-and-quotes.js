var React = require( 'react/addons' );

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
