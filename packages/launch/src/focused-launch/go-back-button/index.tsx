import { BackButton } from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';
import classNames from 'classnames';
import * as React from 'react';
import type { Button } from '@wordpress/components';
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
