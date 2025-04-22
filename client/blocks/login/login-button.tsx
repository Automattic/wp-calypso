import { Button, Spinner } from '@wordpress/components';
import React from 'react';

interface LoginButtonProps {
	isWoo: boolean;
	isSendingEmail: boolean;
	isDisabled: boolean;
	buttonText: string;
}

const LoginButton: React.FC< LoginButtonProps > = ( {
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

export default LoginButton;
