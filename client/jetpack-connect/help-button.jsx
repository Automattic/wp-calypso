/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';

const JetpackConnectHelpButton = ( { translate, onClick } ) => {
	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href="https://jetpack.com/contact-support"
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onClick }
		>
			<Gridicon icon="help-outline" /> { translate( 'Get help connecting your site' ) }
		</LoggedOutFormLinkItem>
	);
};

JetpackConnectHelpButton.propTypes = {
	onClick: PropTypes.func,
};

export default localize( JetpackConnectHelpButton );
