/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';
import type { Button } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { BackButton } from '@automattic/onboarding';
import './style.scss';

declare const __i18n_text_domain__: string;

const GoBackButton: React.FunctionComponent< Button.ButtonProps > = ( { className, ...props } ) => {
	return (
		<BackButton
			{ ...props }
			className={ classNames( 'go-back-button__focused-launch', className ) }
		>
			<Icon icon={ chevronLeft } />
			{ __( 'Go back', __i18n_text_domain__ ) }
		</BackButton>
	);
};

export default GoBackButton;
