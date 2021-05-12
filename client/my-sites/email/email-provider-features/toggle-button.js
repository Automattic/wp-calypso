/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

function EmailProviderFeaturesToggleButton( { handleClick, isSwitched } ) {
	const translate = useTranslate();

	return (
		<Button className="email-provider-features__toggle-button" onClick={ handleClick }>
			<span>{ translate( 'Learn more' ) }</span>

			<Gridicon icon={ isSwitched ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
}

EmailProviderFeaturesToggleButton.propTypes = {
	handleClick: PropTypes.func.isRequired,
	isSwitched: PropTypes.bool.isRequired,
};

export default EmailProviderFeaturesToggleButton;
