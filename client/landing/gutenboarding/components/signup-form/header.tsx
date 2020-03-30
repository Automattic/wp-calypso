/**
 * External dependencies
 */
import React from 'react';
import { Button, Icon } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

interface SignupFormHeaderProps {
	onRequestClose: () => void;
	loginUrl: string;
}

interface CloseButtonProps {
	onClose: () => void;
}

const CustomCloseButton = ( { onClose }: CloseButtonProps ) => {
	const { __: NO__ } = useI18n();
	return (
		<Button onClick={ onClose } label={ NO__( 'Close dialog' ) }>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M1.40456 1L15 15M1 15L14.5954 1" stroke="#1E1E1E" stroke-width="1.5" />
			</svg>
		</Button>
	);
};

const SignupFormHeader = ( { onRequestClose, loginUrl }: SignupFormHeaderProps ) => {
	const { __: NO__ } = useI18n();
	return (
		<div className="signup-form__header">
			<div className="signup-form__header-section">
				<div className="signup-form__header-section-item signup-form__header-wp-logo">
					<Icon icon="wordpress-alt" size={ 24 } />
				</div>
			</div>

			<div className="signup-form__header-section">
				<div className="signup-form__header-section-item">
					<Button className="signup-form__link" isLink href={ loginUrl }>
						{ NO__( 'Log in' ) }
					</Button>
				</div>

				<div className="signup-form__header-section-item signup-form__header-close-button">
					<CustomCloseButton onClose={ onRequestClose } />
				</div>
			</div>
		</div>
	);
};

export default SignupFormHeader;
