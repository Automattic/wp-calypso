/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Route } from '../route';

import './style.scss';

const DomainDetails: React.FunctionComponent = () => {
	return (
		<div>
			<Link to={ Route.Summary }>{ __( 'Go back', __i18n_text_domain__ ) }</Link>
			<p>{ __( 'Choose a domain', __i18n_text_domain__ ) }</p>
		</div>
	);
};

export default DomainDetails;
