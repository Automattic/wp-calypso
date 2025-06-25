import { Button, Spinner } from '@wordpress/components';
import React from 'react';

interface LoginSubmitButtonProps {
	isWoo: boolean;
	isSendingEmail: boolean;
	isDisabled: boolean;
	buttonText: string;
}

const LoginSubmitButton: React.FC< LoginSubmitButtonProps > = ( {
	isWoo,
	isSendingEmail,
	isDisabled,
	buttonText,
} ) => {
	return (
		<Button
			variant="primary"
			isBusy={ ! isWoo && isSendingEmail }
			disabled={ isDisabled }
			type="submit"
			__next40pxDefaultSize
		>
			{ isWoo && isSendingEmail ? <Spinner /> : buttonText }
		</Button>
	);
};

export default LoginSubmitButton;
