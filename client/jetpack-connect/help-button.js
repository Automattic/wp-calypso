/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { localize } from 'i18n-calypso';

const JetpackConnectHelpButton = ( { translate, onClick } ) => {
	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href="https://jetpack.com/contact-support"
			target="_blank" rel="noopener noreferrer"
			onClick={ onClick }
		>
			<Gridicon icon="help-outline" /> { translate( 'Get help connecting your site' ) }
		</LoggedOutFormLinkItem>
	);
};

JetpackConnectHelpButton.propTypes = {
	onClick: PropTypes.func
};

export default localize( JetpackConnectHelpButton );
