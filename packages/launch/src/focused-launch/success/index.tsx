/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Title } from '@automattic/onboarding';

import './style.scss';

const Success: React.FunctionComponent = () => {
	return (
		<div>
			<Title>{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<p>
				{ __(
					"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
					__i18n_text_domain__
				) }
			</p>
		</div>
	);
};

export default Success;
