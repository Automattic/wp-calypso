/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ThankYou } from 'calypso/my-sites/checkout/checkout-thank-you/marketplace/marketplace-thank-you';
import theme from 'calypso/my-sites/marketplace/theme';
import Item from 'calypso/layout/masterbar/item';
import yoastInstalledImage from 'calypso/assets/images/marketplace/yoast-installed.svg';
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

export const TitanSetupThankYou = ( props: TitanSetupThankYouProps ) => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const { domainName, emailAddress = `youremail@${ domainName }` } = props;

	const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );

	const masterbarItem = (
		<Item
			icon="cross"
			onClick={ () => page( emailManagementPath ) }
			tooltip={ translate( 'Manage email' ) }
			tipTarget="close"
		/>
	);

	const thankYouImage = {
		alt: 'yoast logo',
		src: yoastInstalledImage,
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
				/* TODO: Fix URL */
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
					'Manage your emails, create new mailboxes, and import your emails, all within your dashboard.'
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
				masterbarItem={ masterbarItem }
				sections={ [ titanThankYouSection ] }
				showSupportSection={ true }
				thankYouImage={ thankYouImage }
				thankYouTitle={ translate( '%(emailAddress)s is now ready to use', {
					args: {
						emailAddress,
					},
					comment: '%(emailAddress)s is an email address, e.g. info@example.com',
				} ) }
			/>
		</ThemeProvider>
	);
};
