/**
 * External dependencies
 */
import React from 'react';
const debug = require( 'debug' )( 'calypso:vip:dashboard' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import config from 'config';

export default React.createClass( {
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
