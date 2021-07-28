/**
 * External dependencies
 */
import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ThankYou } from 'calypso/components/thank-you';
import theme from 'calypso/my-sites/marketplace/theme';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getTitanEmailUrl } from 'calypso/lib/titan';
import Gridicon from 'calypso/components/gridicon';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

type TitanSetupThankYouProps = {
	domainName: string;
	emailAddress?: string;
};

export const TitanSetupThankYou = ( props: TitanSetupThankYouProps ): JSX.Element => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const { domainName, emailAddress = domainName } = props;

	const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );

	const thankYouImage = {
		alt: 'Thank you',
		src: '/calypso/images/upgrades/thank-you.svg',
	};

	const titanThankYouSection = {
		sectionKey: 'titan_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'titan_whats_next_view_inbox',
				stepTitle: translate( 'Access your inbox' ),
				stepDescription: translate( 'Access your email from anywhere with our built-in webmail.' ),
				stepCta: (
					<FullWidthButton href={ getTitanEmailUrl( emailAddress ) } primary>
						{ translate( 'Go to Inbox' ) }
						<Gridicon icon="external" />
					</FullWidthButton>
				),
			},
			{
				stepKey: 'titan_whats_next_get_mobile_app',
				stepTitle: translate( 'Get mobile app' ),
				stepDescription: translate(
					"Access your email on the go with Titan's Android and iOS apps."
				),
				/* TODO: Fix URL: There are a some services that automatically redirects you to the Android or App Store
				 * regarding your user's agent. Eg: https://tosto.re/ We might use a service like that, to take the user
				 * to the store that is relative to hum (Windows Store? Apple Store? Android Store? Web app?*/
				stepCta: (
					<FullWidthButton href="https://titan.email">
						{ translate( 'Get the app' ) }
					</FullWidthButton>
				),
			},
			{
				stepKey: 'titan_whats_next_manage_email',
				stepTitle: translate( 'Manage your email' ),
				stepDescription: translate(
					'Add or delete mailboxes, migrate existing emails, configure a catch-all email, and much more.'
				),
				stepCta: (
					<FullWidthButton href={ emailManagementPath }>{ translate( 'Manage' ) }</FullWidthButton>
				),
			},
		],
	};

	return (
		<ThemeProvider theme={ theme }>
			<ThankYou
				sections={ [ titanThankYouSection ] }
				showSupportSection={ true }
				thankYouImage={ thankYouImage }
				thankYouTitle={ translate( 'Your email is now ready to use' ) }
			/>
		</ThemeProvider>
	);
};
