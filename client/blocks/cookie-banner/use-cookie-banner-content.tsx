import { useLocalizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { isServer } from '.';
import type { CookieBannerProps } from '@automattic/privacy-toolset';
import type { PropsWithChildren } from 'react';

type LinkProps = PropsWithChildren< { href: string } >;

const LocalizedLink = ( { href, children }: LinkProps ) => {
	const localizeUrl = useLocalizeUrl();
	return <ExternalLink href={ localizeUrl( href ) }>{ children }</ExternalLink>;
};

const Link = ( props: LinkProps ) => {
	// useLocalizeUrl() does not support SSR yet, so we cannot use it on the server.
	if ( isServer ) {
		return <ExternalLink children={ null } { ...props } />;
	}
	return <LocalizedLink { ...props } />;
};

export const useCookieBannerContent = (): CookieBannerProps[ 'content' ] => {
	const localizeUrl = useLocalizeUrl();
	const translate = useTranslate();

	return {
		simpleConsent: {
			description: translate(
				'As an open source company, we take your privacy seriously and want to be as transparent as possible. So: We use cookies to collect some personal data from you (like your browsing data, IP addresses, and other unique identifiers). Some of these cookies we absolutely need in order to make things work, and others you can choose in order to optimize your experience while using our site and services.'
			),
			acceptAllButton: translate( 'Accept all' ),
			customizeButton: translate( 'Customize' ),
		},
		customizedConsent: {
			description: translate(
				'Your privacy is critically important to us. We and our partners use, store, and process your personal data to optimize: our {{strong}}website{{/strong}} such as by improving security or conducting analytics, {{strong}}marketing activities{{/strong}} to help deliver relevant marketing or content, and your {{strong}}user experience{{/strong}} such as by remembering your account name, language settings, or cart information, where applicable. You can customize your cookie settings below. Learn more in our {{privacyPolicyLink}}Privacy Policy{{/privacyPolicyLink}} and {{cookiePolicyLink}}Cookie Policy{{/cookiePolicyLink}}.',
				{
					components: {
						strong: <strong />,
						privacyPolicyLink: <Link href={ localizeUrl( 'https://automattic.com/privacy/' ) } />,
						cookiePolicyLink: <Link href={ localizeUrl( 'https://automattic.com/cookies/' ) } />,
					},
				}
			),
			categories: {
				essential: {
					name: translate( 'Required' ),
					description: translate(
						'These cookies are essential for our websites and services to perform basic functions and are necessary for us to operate certain features, like allowing registered users to authenticate and perform account-related functions, storing preferences set by users (like account name, language, and location), and ensuring our services operate properly.'
					),
				},
				analytics: {
					name: translate( 'Analytics' ),
					description: translate(
						'These cookies allow us to optimize performance by collecting information on how users interact with our websites.'
					),
				},
				advertising: {
					name: translate( 'Advertising' ),
					description: translate(
						'We and our advertising partners set these cookies to provide you with relevant content and to understand that content’s effectiveness.'
					),
				},
			},
			acceptSelectionButton: translate( 'Accept selection' ),
		},
	};
};
