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

const PlanDetails: React.FunctionComponent = () => {
	return (
		<div>
			<Link to={ Route.Summary }>{ __( 'Go back', __i18n_text_domain__ ) }</Link>
			<p>{ __( 'Select a plan', __i18n_text_domain__ ) }</p>
		</div>
	);
};

export default PlanDetails;
