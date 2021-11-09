import { Gridicon } from '@automattic/components';
import { localize, useTranslate } from 'i18n-calypso';
import { connect, useSelector } from 'react-redux';
import thankYouEmail from 'calypso/assets/images/illustrations/thank-you-email.svg';
import { ThankYou } from 'calypso/components/thank-you';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getTitanEmailUrl } from 'calypso/lib/titan';
import { TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP } from 'calypso/lib/titan/constants';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import {
	emailManagement,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

/**
 * Import styles
 */
import './style.scss';

type TitanSetUpThankYouProps = {
	domainName: string;
	emailAddress?: string;
	title?: string;
	subtitle?: string;
};

const TitanSetUpThankYou = ( props: TitanSetUpThankYouProps ): JSX.Element => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const { domainName, emailAddress, subtitle, title } = props;

	const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );

	const thankYouImage = {
		alt: translate( 'Thank you' ),
		src: thankYouEmail,
	};

	const titanControlPanelUrl = emailManagementTitanControlPanelRedirect(
		selectedSiteSlug,
		domainName,
		currentRoute,
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
		}
	);

	const titanThankYouSection = {
		sectionKey: 'titan_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'titan_whats_next_view_inbox',
				stepTitle: translate( 'Access your inbox' ),
				stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
				stepCta: (
					<FullWidthButton
						href={ getTitanEmailUrl( emailAddress ) }
						primary
						target="_blank"
						onClick={ () => {
							recordEmailAppLaunchEvent( {
								provider: 'titan',
								app: 'webmail',
								context: 'checkout-thank-you',
							} );
						} }
					>
						{ translate( 'Go to Inbox' ) }
						<Gridicon className="titan-set-up-thank-you__icon-external" icon="external" />
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
						href={ titanControlPanelUrl }
						target="_blank"
						onClick={ () => {
							recordEmailAppLaunchEvent( {
								provider: 'titan',
								app: 'app',
								context: 'checkout-thank-you',
							} );
						} }
					>
						{ translate( 'Get app' ) }
						<Gridicon className="titan-set-up-thank-you__icon-external" icon="external" />
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
		<ThankYou
			containerClassName="titan-set-up-thank-you__container"
			headerClassName={ 'titan-set-up-thank-you__header' }
			sections={ [ titanThankYouSection ] }
			showSupportSection={ true }
			thankYouImage={ thankYouImage }
			thankYouTitle={ title ?? translate( 'Your email is now ready to use' ) }
			thankYouSubtitle={ subtitle }
		/>
	);
};

export default connect( ( state, ownProps: TitanSetUpThankYouProps ) => {
	const selectedSite = getSelectedSite( state ) as SiteData;

	const domain = getSelectedDomain( {
		domains: getDomainsBySite( state, selectedSite ),
		isSiteRedirect: false,
		selectedDomainName: ownProps.domainName,
	} );

	return {
		currentRoute: getCurrentRoute( state ),
		domain,
		selectedSite,
	};
} )( localize( TitanSetUpThankYou ) );
