/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { BackButton } from '@automattic/onboarding';
import './style.scss';

declare const __i18n_text_domain__: string;

export default function GoBackButton( props ) {
	return (
		<BackButton { ...props }>
			<Icon icon={ chevronLeft } />
			{ __( 'Go back', __i18n_text_domain__ ) }
		</BackButton>
	);
}
