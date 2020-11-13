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
import { useFocusedLaunchModal, useSiteDomains } from '../../hooks';

import './style.scss';

const Success: React.FunctionComponent = () => {
	const { siteSubdomain } = useSiteDomains();
	const { unsetModalDismissible, closeFocusedLaunch } = useFocusedLaunchModal();

	// When in the Success view, the user can't dismiss the modal anymore
	useEffect( () => {
		unsetModalDismissible();
	}, [ unsetModalDismissible ] );

	return (
		<div>
			<Title>{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<p>
				{ __(
					"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
					__i18n_text_domain__
				) }
			</p>

			{ /* @TODO: this will work only when the modal in in the block editor. */ }
			<button onClick={ closeFocusedLaunch }>
				{ __( 'Continue editing', __i18n_text_domain__ ) }
			</button>

			<a href={ `/home/${ siteSubdomain?.domain }` }>{ __( 'Back home', __i18n_text_domain__ ) }</a>
		</div>
	);
};

export default Success;
