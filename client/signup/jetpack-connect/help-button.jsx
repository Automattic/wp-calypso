/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

const JetpackConnectHelpButton = ( { translate } ) => {
	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href="https://jetpack.com/contact-support"
			target="_blank" rel="noopener noreferrer"
		>
			<Gridicon icon="help-outline" /> { translate( 'Get help connecting your site' ) }
		</LoggedOutFormLinkItem>
	);
};

export default localize( JetpackConnectHelpButton );
