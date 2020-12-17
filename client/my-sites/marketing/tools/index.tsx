/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import config from 'calypso/config';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import MarketingToolsFeature from './feature';
import MarketingToolsHeader from './header';
import {
	marketingConnections,
	marketingBusinessTools,
	marketingUltimateTrafficGuide,
} from 'calypso/my-sites/marketing/paths';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';

/**
 * Images
 */
import earnIllustration from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import facebookMessenger from 'calypso/assets/images/illustrations/facebook-messenger.svg';
import canvaLogo from 'calypso/assets/images/illustrations/canva-logo.svg';
import sendinblueLogo from 'calypso/assets/images/illustrations/sendinblue-logo.svg';
import simpletextLogo from 'calypso/assets/images/illustrations/simpletext-logo.png';
import verblioLogo from 'calypso/assets/images/illustrations/verblio-logo.png';
import rocket from 'calypso/assets/images/customer-home/illustration--rocket.svg';

/**
 * Types
 */
import * as T from 'calypso/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	recordTracksEvent: typeof recordTracksEventAction;
	selectedSiteSlug: T.SiteSlug | null;
}

export const MarketingTools: FunctionComponent< Props > = ( {
	recordTracksEvent,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( marketingBusinessTools( selectedSiteSlug ) );
	};

	const handleEarnClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_earn_button_click' );

		page( `/earn/${ selectedSiteSlug }` );
	};

	const handleCreateALogoClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_create_a_logo_button_click' );
	};

	const handleFacebookMessengerClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_facebook_messenger_button_click' );
	};

	const handleCanvaClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_canva_button_click' );
	};

	const handleSendinblueClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_sendinblue_button_click' );
	};

	const handleVerblioClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_verblio_button_click' );
	};

	const handleStartSharingClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_start_sharing_button_click' );

		page( marketingConnections( selectedSiteSlug ) );
	};

	const handleUltimateTrafficGuideClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_ultimate_traffic_guide_button_click' );

		page( marketingUltimateTrafficGuide( selectedSiteSlug ) );
	};

	const isEnglish = config( 'english_locales' ).includes( getLocaleSlug() );

	return (
		<Fragment>
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingToolsHeader handleButtonClick={ handleBusinessToolsClick } />

			<div className="tools__feature-list">
				<MarketingToolsFeature
					title={ translate( 'Want to build a great brand? Start with a great logo' ) }
					description={ translate(
						'A custom logo helps your brand pop and makes your site memorable. Make a professional logo in a few clicks with our partner Fiverr.'
					) }
					imagePath={ fiverrLogo }
				>
					<Button
						onClick={ handleCreateALogoClick }
						href="https://wp.me/logo-maker"
						target="_blank"
					>
						{ translate( 'Create a logo' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Create beautiful designs and graphics for your website' ) }
					description={ translate(
						"Everyone can create professional designs with Canva. It's a free and drag-and-drop tool for creating images, cover images, and more."
					) }
					imagePath={ canvaLogo }
				>
					<Button onClick={ handleCanvaClick } href="https://wp.me/design-tool" target="_blank">
						{ translate( 'Create custom images with Canva' ) }
					</Button>
				</MarketingToolsFeature>

				{ getLocaleSlug() === 'en' && (
					<MarketingToolsFeature
						title={ translate( 'Want to convert visitors into customers? Add Messenger Chat!' ) }
						description={ translate(
							'Customers like to buy from a business they can message. Build trust, help customers, and provide support with the Official Facebook Messenger Chat Plugin. {{em}}Available on Business and eCommerce plans{{/em}}.',
							{
								components: {
									em: <em />,
								},
							}
						) }
						imagePath={ facebookMessenger }
					>
						<Button
							onClick={ handleFacebookMessengerClick }
							href="https://wordpress.com/plugins/facebook-messenger-customer-chat"
							target="_blank"
						>
							{ translate( 'Add Messenger Chat' ) }
						</Button>
					</MarketingToolsFeature>
				) }

				<MarketingToolsFeature
					title={ translate( 'Build your community, following, and income with Earn tools' ) }
					description={ translate(
						'Increase engagement and income on your site by accepting payments for just about anything – physical and digital goods, services, donations, or access to exclusive content.'
					) }
					imagePath={ earnIllustration }
				>
					<Button onClick={ handleEarnClick }>{ translate( 'Start earning' ) }</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Get social, and share your blog posts where the people are' ) }
					description={ translate(
						"Use your site's Publicize tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Twitter, Facebook, LinkedIn, and more."
					) }
					imagePath="/calypso/images/marketing/social-media-logos.svg"
				>
					<Button onClick={ handleStartSharingClick }>{ translate( 'Start sharing' ) }</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'SimpleTexting' ) }
					description={ translate(
						'SimpleTexting makes it easy, fast and affordable to send SMS marketing campaigns or engage in 1-on-1 conversations with your customers.'
					) }
					imagePath={ simpletextLogo }
				>
					<Button
						onClick={ handleCreateALogoClick }
						href="https://simpletexting.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Start texting' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Turn your visitors into customers' ) }
					description={ translate(
						'Sendinblue is an all-in-one marketing and CRM platform to help you grow your business through building stronger customer relationships.'
					) }
					imagePath={ sendinblueLogo }
				>
					<Button
						onClick={ handleSendinblueClick }
						href="https://sendinblue.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Start with CRM' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Get help with content for your blog or website' ) }
					description={ translate(
						'Verblio makes blog and content creation happen. Its writers can help create high-powered content for your website that drives SEO.'
					) }
					imagePath={ verblioLogo }
				>
					<Button
						onClick={ handleVerblioClick }
						href="https://verblio.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Start creating content' ) }
					</Button>
				</MarketingToolsFeature>

				{ isEnglish && (
					<MarketingToolsFeature
						title={ translate( 'Introducing the WordPress.com Ultimate Traffic Guide' ) }
						description={ translate(
							"Our brand new Ultimate Traffic Guide reveals more than a dozen of today's most effective traffic techniques. " +
								'The guide is appropriate for beginner to intermediate users.'
						) }
						imagePath={ rocket }
					>
						<Button onClick={ handleUltimateTrafficGuideClick }>
							{ translate( 'Download now' ) }
						</Button>
					</MarketingToolsFeature>
				) }
			</div>
		</Fragment>
	);
};

export default connect(
	( state ) => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingTools );
