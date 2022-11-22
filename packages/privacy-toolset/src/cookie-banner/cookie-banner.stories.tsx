import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import { CookieBanner, CookieBannerProps } from '.';

export default {
	title: 'Cookie Banner',
};

export const Default: Story< CookieBannerProps > = ( args ) => <CookieBanner { ...args } />;

Default.args = {
	onAccept: action( 'accept' ),
	content: {
		simpleConsent: {
			description: (
				<>
					We and our partners process your personal data (such as browsing data, IP addresses,
					cookie information, and other unique identifiers) based on your consent and/or our
					legitimate interest to optimize our website, marketing activities, and your user
					experience.
				</>
			),
			acceptAllButton: 'Accept All',
			customizeButton: 'Customize',
		},
		customizedConsent: {
			description: (
				<>
					Your privacy is critically important to us. We and our partners use, store, and process
					your personal data to optimize: our <strong>website</strong> such as by improving security
					or conducting analytics, <strong>marketing activities</strong> to help deliver relevant
					marketing or content, and your <strong>user experience</strong> such as by remembering
					your account name, language settings, or cart information, where applicable. You can
					customize your cookie settings below. Learn more in our{ ' ' }
					<a href="https://automattic.com/privacy/" target="_blank" rel="noreferrer">
						Privacy Policy
					</a>{ ' ' }
					and{ ' ' }
					<a href="https://automattic.com/cookies/" target="_blank" rel="noreferrer">
						Cookie Policy
					</a>
					.
				</>
			),
			categories: {
				essential: {
					name: 'Required',
					description: (
						<>
							These cookies are essential for our websites and services to perform basic functions
							and are necessary for us to operate certain features. These include those required to
							allow registered users to authenticate and perform account-related functions, store
							preferences set by users such as account name, language, and location, and ensure our
							services are operating properly.
						</>
					),
				},
				analytics: {
					name: 'Analytics',
					description: (
						<>
							These cookies allow us to optimize performance by collecting information on how users
							interact with our websites, including which pages are visited most, as well as other
							analytical data. We use these details to improve how our websites function and to
							understand how users interact with them. To learn more about how to control your
							cookie preferences, go to{ ' ' }
							<a target="_blank" href="https://automattic.com/cookies/" rel="noreferrer">
								https://automattic.com/cookies/
							</a>
							.
						</>
					),
				},
				advertising: {
					name: 'Advertising',
					description: (
						<>
							These cookies are set by us and our advertising partners to provide you with relevant
							content and to understand that content’s effectiveness. They may be used to collect
							information about your online activities over time and across different websites to
							predict your preferences and to display more relevant advertisements to you. These
							cookies also allow a profile to be built about you and your interests, and enable
							personalized ads to be shown to you based on your profile.
						</>
					),
				},
			},
			acceptSelectionButton: 'Accept Selection',
		},
	},
};
