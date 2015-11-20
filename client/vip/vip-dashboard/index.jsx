/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:vip:dashboard' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Main = require( 'components/main' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'vipDashboard',

	componentWillMount: function() {
		debug( 'Mounting VIP Dashboard React component.' );
	},

	render: function() {
		//var site = this.props.site;
		if ( ! config.isEnabled( 'vip' ) ) {
			return;
		}

		return (
			<Main className="vip-dashboard">
				<Card>
					<h2>VIP Updates</h2>
				</Card>
				{ /*( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?

				: null */}
			</Main>
		);
	}
} );
