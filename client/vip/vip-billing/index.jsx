/**
 * External dependencies
 */
import React from 'react';
const debug = require( 'debug' )( 'calypso:vip:billing' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import config from 'config';

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
