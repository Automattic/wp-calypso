/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'JetpackConnectHelpButton',

	render() {
		return (
			<LoggedOutFormLinkItem className="jetpack-connect__help-button" href="https://jetpack.com/contact-support" target="_blank" rel="noopener noreferrer">
				<Gridicon icon="help-outline" /> { this.translate( 'Get help connecting your site' ) }
			</LoggedOutFormLinkItem>
		);
	}
} );
