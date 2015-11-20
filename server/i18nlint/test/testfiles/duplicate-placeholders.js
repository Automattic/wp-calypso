
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:test:i18nlint' );

module.exports = React.createClass( {
	displayName: 'MySitesSidebar',

	componentDidMount: function() {
		debug( 'The sidebar React component is mounted.' );
	},

	render: function() {
		return React.createElement(
			'div',
			this.translate( 'One: %s, Two: %s', {
				args: [ '1', '2' ]
			} )
		);
	}
} );
