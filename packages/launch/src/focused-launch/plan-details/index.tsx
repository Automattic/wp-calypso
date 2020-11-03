/**
 * External dependencies
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { FocusedLaunchRoute } from '../routes';

import './style.scss';

const FocusedLaunchPlanDetails: React.FunctionComponent = () => {
	return (
		<div>
			<Link to={ FocusedLaunchRoute.Summary }>{ __( 'Go back', __i18n_text_domain__ ) }</Link>
			<p>{ __( 'Select a plan', __i18n_text_domain__ ) }</p>
		</div>
	);
};

export default FocusedLaunchPlanDetails;
