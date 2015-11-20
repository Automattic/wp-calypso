/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:vip:deploys' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Main = require( 'components/main' ),
	config = require( 'config' );

module.exports = React.createClass({
	displayName: 'vipDeploys',

	componentWillMount: function() {
		debug( 'Mounting VIP Deploys React component.' );
	},

	render: function() {
		//var site = this.props.site;
		if ( ! config.isEnabled( 'vip/deploys' )) {
			return;
		}

		return (
			<Main className="vip-deploys">
				<Card>
					<h2>VIP Deploys</h2>
				</Card>
				{ /*( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?

				: null */}
			</Main>
		);
	}
});