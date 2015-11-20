/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:vip:billing' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Main = require( 'components/main' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'vipBilling',

	componentWillMount: function() {
		debug( 'Mounting VIP Billing React component.' );
	},

	render: function() {
		//var site = this.props.site;
		if ( ! config.isEnabled( 'vip/billing' ) ) {
			return;
		}

		return (
			<Main className="vip-billing">
				<Card>
					<h2>VIP Billing</h2>
				</Card>
				{ /*( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?

				: null */}
			</Main>
		);
	}
} );
