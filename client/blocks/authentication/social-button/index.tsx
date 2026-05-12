import { Button } from '@wordpress/components';
import clsx from 'clsx';
import AppleIcon from 'calypso/components/social-icons/apple';
import GitHubIcon from 'calypso/components/social-icons/github';
import GoogleIcon from 'calypso/components/social-icons/google';
import MailIcon from 'calypso/components/social-icons/mail';
import PayPalIcon from 'calypso/components/social-icons/paypal';
import type { MouseEventHandler, ReactNode } from 'react';

import './style.scss';

export type SocialProvider = 'google' | 'apple' | 'github' | 'paypal' | 'email';

type SocialButtonProps = {
	provider: SocialProvider;
	children: ReactNode;
	onClick?: MouseEventHandler< HTMLElement >;
	disabled?: boolean;
	className?: string;
	'aria-label'?: string;
};

const providerIcon: Record< SocialProvider, JSX.Element > = {
	google: <GoogleIcon />,
	apple: <AppleIcon />,
	github: <GitHubIcon />,
	paypal: <PayPalIcon />,
	email: <MailIcon />,
};

const SocialButton = ( {
	provider,
	children,
	onClick,
	disabled,
	className,
	'aria-label': ariaLabel,
}: SocialButtonProps ) => (
	<Button
		variant="secondary"
		__next40pxDefaultSize
		className={ clsx( 'auth-social-button', className ) }
		icon={ providerIcon[ provider ] }
		disabled={ disabled }
		aria-label={ ariaLabel }
		onClick={ onClick }
	>
		{ children }
	</Button>
);

export default SocialButton;
