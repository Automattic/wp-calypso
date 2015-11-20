/* eslint-disable */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:test:i18nlint' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	CurrentSite = require( 'my-sites/current-site' );

// Some padding jsx to increase my confidence that the sourcemaps are
// working
var CommentBox = React.createClass( {
	displayName: 'CommentBox',
	render: function() {
		return (
		React.createElement( 'div', {
			className: "commentBox"
		},
			"Hello, world! I am a CommentBox."
		)
		);
	}
} );

module.exports = React.createClass( {
	displayName: 'MySitesSidebar',

	componentDidMount: function() {
		debug( 'The sidebar React component is mounted.' );
	},

	render: function() {
		return;
		<div>{ this.translate( 'One: %s, Two: %s', { args: ['1','2'] } ) }</div>;
	}

} );
/* eslint-enable */
