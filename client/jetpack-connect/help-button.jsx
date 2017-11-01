/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { localize } from 'i18n-calypso';

const JetpackConnectHelpButton = ( { label, translate, onClick } ) => {
	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href="https://jetpack.com/contact-support"
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onClick }
		>
			<Gridicon icon="help-outline" size={ 18 } />{' '}
			{ label || translate( 'Get help connecting your site' ) }
		</LoggedOutFormLinkItem>
	);
};

JetpackConnectHelpButton.propTypes = {
	onClick: PropTypes.func,
	label: PropTypes.string,
};

export default localize( JetpackConnectHelpButton );
