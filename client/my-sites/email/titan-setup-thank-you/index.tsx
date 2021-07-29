/**
 * External dependencies
 */
import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { connect, useSelector } from 'react-redux';
import { localize, useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ThankYou } from 'calypso/components/thank-you';
import theme from 'calypso/my-sites/marketplace/theme';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import {
	emailManagement,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getTitanEmailUrl } from 'calypso/lib/titan';
import Gridicon from 'calypso/components/gridicon';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP } from 'calypso/lib/titan/constants';

/**
 * Import styles
 */
import './style.scss';

type TitanSetupThankYouProps = {
	domainName: string;
	emailAddress: string;
};

const TitanSetupThankYou = ( props: TitanSetupThankYouProps ): JSX.Element => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const { domainName, emailAddress } = props;

	const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );

	const thankYouImage = {
		alt: translate( 'Thank you' ),
		src: '/calypso/images/upgrades/thank-you.svg',
	};

	const getControlPanelUrl = ( context: string ) => {
		return emailManagementTitanControlPanelRedirect( selectedSiteSlug, domainName, currentRoute, {
			context,
		} );
	};

	const titanThankYouSection = {
		sectionKey: 'titan_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'titan_whats_next_view_inbox',
				stepTitle: translate( 'Access your inbox' ),
				stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
				stepCta: (
					<FullWidthButton href={ getTitanEmailUrl( emailAddress ) } primary>
						{ translate( 'Go to Inbox' ) }
						<Gridicon className={ 'titan-setup-thank-you__icon-inbox' } icon="external" />
					</FullWidthButton>
				),
			},
			{
				stepKey: 'titan_whats_next_get_mobile_app',
				stepTitle: translate( 'Get mobile app' ),
				stepDescription: translate(
					"Access your email on the go with Titan's Android and iOS apps."
				),
				stepCta: (
					<FullWidthButton
						href={ getControlPanelUrl( TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP ) }
					>
						{ translate( 'Get app' ) }
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

export default connect( ( state, ownProps: TitanSetupThankYouProps ) => {
	const selectedSite = getSelectedSite( state ) as SiteData;

	const domain = getSelectedDomain( {
		domains: getDomainsBySite( state, selectedSite ),
		isSiteRedirect: false,
		selectedDomainName: ownProps.domainName,
	} );

	return {
		currentRoute: getCurrentRoute( state ),
		domain,
		hasSubscription: hasEmailSubscription( domain ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase: getEmailPurchaseByDomain( state, domain ),
		selectedSite,
	};
} )( localize( TitanSetupThankYou ) );
