/**
 * External dependencies
 */
import React from 'react';
const debug = require( 'debug' )( 'calypso:vip:backups' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import config from 'config';

module.exports = React.createClass( {
	displayName: 'vipBackups',

	componentWillMount: function() {
		debug( 'Mounting VIP Backups React component.' );
	},

	render: function() {
		//var site = this.props.site;
		if ( ! config.isEnabled( 'vip/backups' ) ) {
			return;
		}

		return (
			<Main className="vip-backups">
				<Card>
					<h2>VIP Backups</h2>
				</Card>
				{ /*( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?

				: null */}
			</Main>
		);
	}
} );
