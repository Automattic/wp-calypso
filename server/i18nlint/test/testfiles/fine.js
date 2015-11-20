
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
			this.translate( 'One: %(one)s, Two: %(two)s', {
				args: {
					one: '1',
					two: '2'
				}
			} ) +
			this.translate( 'Three: %d', {
				args: [ 3 ]
			} ) +
			this.translate( 'Four: %d', {
				args: [ 4 ]
			} )
		);
	}
} );
