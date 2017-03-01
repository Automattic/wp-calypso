/**
 * External dependencies
 */
import React from 'react';
const debug = require( 'debug' )( 'calypso:vip:deploys' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import config from 'config';

export default React.createClass( {
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
