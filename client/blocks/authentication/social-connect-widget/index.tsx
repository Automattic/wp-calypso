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
	google: <GoogleIcon width={ 32 } height={ 32 } />,
	apple: <AppleIcon width={ 32 } height={ 32 } />,
	github: <GitHubIcon width={ 32 } height={ 32 } />,
	paypal: <PayPalIcon width={ 32 } height={ 32 } />,
};

const SocialConnectWidget = ( { service }: SocialConnectWidgetProps ) => (
	// The widget is a decorative summary of "[service] ↔ WordPress" — the
	// connection's meaning is conveyed in the surrounding copy. Hide it
	// from assistive tech so screen readers don't announce three separate
	// graphics with no context.
	<div className="auth-social-connect-widget" aria-hidden="true">
		<div className="auth-social-connect-widget__service-logo">{ serviceIcon[ service ] }</div>
		<svg
			className="auth-social-connect-widget__dots"
			width="48"
			height="4"
			viewBox="0 0 48 4"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g stroke="none" fill="none" fillRule="evenodd">
				<circle className="auth-social-connect-widget__dot" cx="2" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="13" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="24" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot is-accent" cx="35" cy="2" r="2" />
				<circle className="auth-social-connect-widget__dot" cx="46" cy="2" r="2" />
			</g>
		</svg>
		<SocialLogo className="auth-social-connect-widget__wp-logo" icon="wordpress" size={ 40 } />
	</div>
);

export default SocialConnectWidget;
