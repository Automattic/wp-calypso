/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

interface SignupFormHeaderProps {
	onRequestClose: () => void;
}

interface CloseButtonProps {
	onClose: () => void;
}

const CustomCloseButton = ( { onClose }: CloseButtonProps ) => {
	const { __ } = useI18n();
	return (
		<Button onClick={ onClose } label={ __( 'Close dialog' ) }>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M1.40456 1L15 15M1 15L14.5954 1" stroke="#1E1E1E" strokeWidth="1.5" />
			</svg>
		</Button>
	);
};

const SignupFormHeader = ( { onRequestClose }: SignupFormHeaderProps ) => {
	return (
		<div className="signup-form__header">
			<div className="signup-form__header-section">
				<div className="signup-form__header-section-item signup-form__header-wp-logo">
					<Icon icon={ wordpress } size={ 28 } />
				</div>
			</div>

			<div className="signup-form__header-section">
				<div className="signup-form__header-section-item signup-form__header-close-button">
					<CustomCloseButton onClose={ onRequestClose } />
				</div>
			</div>
		</div>
	);
};

export default SignupFormHeader;
