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

function EmailProviderFeaturesButton( { handleClick, isToggled } ) {
	const translate = useTranslate();

	return (
		<Button className="email-provider-features__button" onClick={ handleClick }>
			<span>{ translate( 'Learn more' ) }</span>

			<Gridicon icon={ isToggled ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
}

EmailProviderFeaturesButton.propTypes = {
	handleClick: PropTypes.func.isRequired,
	isToggled: PropTypes.bool.isRequired,
};

export default EmailProviderFeaturesButton;
