import AppleIcon from 'calypso/components/social-icons/apple';
import GitHubIcon from 'calypso/components/social-icons/github';
import GoogleIcon from 'calypso/components/social-icons/google';
import PayPalIcon from 'calypso/components/social-icons/paypal';
import SocialLogo from 'calypso/components/social-logo';
import type { ReactNode } from 'react';

import './style.scss';

export type SocialConnectService = 'google' | 'apple' | 'github' | 'paypal';

type SocialConnectWidgetProps = {
	service: SocialConnectService;
};

const serviceIcon: Record< SocialConnectService, ReactNode > = {
	google: <GoogleIcon width={ 48 } height={ 48 } />,
	apple: <AppleIcon width={ 48 } height={ 48 } />,
	github: <GitHubIcon width={ 48 } height={ 48 } />,
	paypal: <PayPalIcon width={ 48 } height={ 48 } />,
};

const SocialConnectWidget = ( { service }: SocialConnectWidgetProps ) => (
	<div className="auth-social-connect-widget">
		<div className="auth-social-connect-widget__service-logo">{ serviceIcon[ service ] }</div>
		<svg
			className="auth-social-connect-widget__dots"
			width="48"
			height="4"
			viewBox="0 0 48 4"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<g stroke="none" fill="none" fillRule="evenodd">
				<circle className="auth-social-connect-widget__dot" cx="2" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="13" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="24" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot is-accent" cx="35" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="46" cy="2" r="2" />
			</g>
		</svg>
		<SocialLogo className="auth-social-connect-widget__wp-logo" icon="wordpress" size={ 48 } />
	</div>
);

export default SocialConnectWidget;
