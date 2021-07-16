/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './wpcom-domain-item.scss';

export default function WpcomDomainItem( { domain } ) {
	return (
		<div className="wpcom-domain-item">
			<span>
				{ __( 'Your free WordPress.com address is ' ) }
				<strong>{ domain.domain }</strong>
			</span>
			<Button compact>Manage</Button>
		</div>
	);
}

WpcomDomainItem.propTypes = {
	domain: PropTypes.object.isRequired,
};

// WpcomDomainItem.defaultProps = {
// };
