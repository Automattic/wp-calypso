/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Gridicon from 'components/gridicon';
import olarkActions from 'lib/olark-store/actions';
import UserModule from 'lib/user';

const user = UserModule();

export default React.createClass( {
	displayName: 'JetpackConnectLiveChatButton',

	handleClick() {
		olarkActions.expandBox();
	},

	render() {
		if ( ! user.get() ) {
			return null;
		}

		return (
			<LoggedOutFormLinkItem className="jetpack-connect__live-chat" onClick={ this.handleClick }>
				<Gridicon icon="help-outline" /> { this.translate( 'Get help connecting your site' ) }
			</LoggedOutFormLinkItem>
		);
	}
} );
