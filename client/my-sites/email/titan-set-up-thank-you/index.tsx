import { isFreePlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import thankYouEmail from 'calypso/assets/images/illustrations/thank-you-email.svg';
import { ThankYou } from 'calypso/components/thank-you';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP } from 'calypso/lib/titan/constants';
import { addQueryArgs } from 'calypso/lib/url';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import {
	emailManagement,
	emailManagementMailboxes,
	emailManagementTitanControlPanelRedirect,
	emailManagementTitanSetUpMailbox,
} from 'calypso/my-sites/email/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Import styles
 */
import './style.scss';

type TitanSetUpThankYouProps = {
	containerClassName?: string;
	emailNeedsSetup?: boolean;
	domainName: string;
	emailAddress?: string;
	isDomainOnlySite?: boolean;
	title?: string;
	subtitle?: string;
};

const TitanSetUpThankYou = ( {
	containerClassName,
	emailNeedsSetup,
	domainName,
	emailAddress,
	isDomainOnlySite = false,
	subtitle,
	title,
}: TitanSetUpThankYouProps ) => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug ?? ( isDomainOnlySite ? domainName : null );
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();
	const translate = useTranslate();

	const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );
	const mailboxesPath = emailManagementMailboxes( selectedSiteSlug );

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

	let nextSteps = [
		{
			stepKey: 'titan_whats_next_view_inbox',
			stepTitle: translate( 'Access your mailboxes' ),
			stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
			stepCta: (
				<FullWidthButton
					href={ getTitanEmailUrl(
						titanAppsUrlPrefix,
						emailAddress,
						false,
						`${ window.location.protocol }//${ window.location.host }${ mailboxesPath }`
					) }
					primary
					onClick={ () => {
						recordEmailAppLaunchEvent( {
							provider: 'titan',
							app: 'webmail',
							context: 'checkout-thank-you',
						} );
					} }
				>
					{ translate( 'Your Mailboxes' ) }
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
	];

	if ( emailNeedsSetup ) {
		const siteNeedsSetup =
			! isDomainOnlySite && ! isFreePlan( selectedSite?.plan?.product_slug ?? '' );

		nextSteps = [
			{
				stepKey: 'titan_whats_next_setup_mailbox',
				stepTitle: translate( 'Set up your Professional Email' ),
				stepDescription: translate(
					'Complete your Professional Email setup to start sending and receiving emails from your custom domain today.'
				),
				stepCta: (
					<FullWidthButton
						href={ emailManagementTitanSetUpMailbox( selectedSiteSlug ?? '', domainName ) }
						primary={ ! siteNeedsSetup }
					>
						{ translate( 'Set up mailbox' ) }
					</FullWidthButton>
				),
			},
		];

		if ( siteNeedsSetup ) {
			nextSteps.unshift( {
				stepKey: 'titan_whats_next_setup_site',
				stepTitle: translate( 'Site setup' ),
				stepDescription: translate( 'Choose a theme, customize and launch your site.' ),
				stepCta: (
					<FullWidthButton
						href={ addQueryArgs( { siteId: selectedSite?.ID }, '/setup' ) }
						primary
						// The section "/setup" is not defined as a page.js routing path, so we
						// force a non-pushState navigation with rel=external.
						rel="external"
					>
						{ translate( 'Set up your site' ) }
					</FullWidthButton>
				),
			} );
		}
	}

	const titanThankYouSection = {
		sectionKey: 'titan_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps,
	};

	return (
		<ThankYou
			containerClassName={ classNames( 'titan-set-up-thank-you__container', containerClassName ) }
			headerClassName="titan-set-up-thank-you__header"
			sections={ [ titanThankYouSection ] }
			showSupportSection={ true }
			thankYouImage={ thankYouImage }
			thankYouTitle={ title ?? translate( 'Your email is now ready to use' ) }
			thankYouSubtitle={ subtitle }
		/>
	);
};

export default TitanSetUpThankYou;
