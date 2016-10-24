/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site' );

module.exports = React.createClass( {
	displayName: 'SitePlaceholder',

	componentDidMount: function() {
		debug( 'The Site component is mounted.' );
	},

	render: function() {
		return (
			<div className="site is-loading">
				<div className="site__content">
					<div className="site-icon" />
					<div className="site__info">
						<div className="site__title">This is an example</div>
						<div className="site__domain">example.wordpress.com</div>
					</div>
				</div>
			</div>
		);
	}
} );
