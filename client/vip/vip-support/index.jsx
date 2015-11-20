/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:vip:support' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Main = require( 'components/main' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'vipSupport',

	componentWillMount: function() {
		debug( 'Mounting VIP Support React component.' );
	},

	render: function() {
		//var site = this.props.site;
		if ( ! config.isEnabled( 'vip/support' ) ) {
			return;
		}

		return (
			<Main className="vip-support">
				<Card>
					<h2>VIP Support</h2>
				</Card>
				{ /*( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?

				: null */}
			</Main>
		);
	}
} );
