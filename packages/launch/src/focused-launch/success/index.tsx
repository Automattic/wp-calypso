/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Title } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { useLaunchModal, useSiteDomains } from '../../hooks';

import './style.scss';

const Success: React.FunctionComponent = () => {
	const { siteSubdomain } = useSiteDomains();
	const { setModalDismissible } = useLaunchModal();

	// When in the Success view, the user can't dismiss the modal anymore
	useEffect( () => {
		setModalDismissible?.( false );
	}, [ setModalDismissible ] );

	return (
		<div>
			<Title>{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<p>
				{ __(
					"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
					__i18n_text_domain__
				) }
			</p>

			<a href={ `/home/${ siteSubdomain?.domain }` }>Back home</a>
		</div>
	);
};

export default Success;
