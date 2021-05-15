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

function EmailProviderFeaturesToggleButton( { handleClick, isRelatedContentExpanded } ) {
	const translate = useTranslate();

	return (
		<Button className="email-provider-features__toggle-button" onClick={ handleClick }>
			<span>{ translate( 'Learn more' ) }</span>

			<Gridicon icon={ isRelatedContentExpanded ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
}

EmailProviderFeaturesToggleButton.propTypes = {
	handleClick: PropTypes.func.isRequired,
	isRelatedContentExpanded: PropTypes.bool.isRequired,
};

export default EmailProviderFeaturesToggleButton;
