import { MouseEvent, ReactNode } from 'react';
import SocialLoginButton, {
	ExchangeCodeForTokenResponse,
} from 'calypso/components/social-buttons/social-login-button';
import PayPalIcon from 'calypso/components/social-icons/paypal';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type Props = {
	children?: ReactNode;
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	isLogin: boolean;
	responseHandler: ( response: ExchangeCodeForTokenResponse ) => void;
};

export const PayPalLoginButton = ( { children, onClick, isLogin, responseHandler }: Props ) => {
	return (
		<SocialLoginButton
			service="paypal"
			label="PayPal"
			icon={ ( { isDisabled } ) => <PayPalIcon isDisabled={ isDisabled } /> }
			isLogin={ isLogin }
			responseHandler={ responseHandler }
			onClick={ ( e, redirectUri ) => {
				onClick?.( e );

				window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/paypal/app-authorize?redirect_uri=${ redirectUri }&ux_mode=redirect`;
			} }
			children={ children }
		/>
	);
};

export default PayPalLoginButton;
