import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import page from 'page';
import { Fragment, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import rocket from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import earnIllustration from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import canvaLogo from 'calypso/assets/images/illustrations/canva-logo.svg';
import facebookLogo from 'calypso/assets/images/illustrations/facebook-logo.png';
import sendinblueLogo from 'calypso/assets/images/illustrations/sendinblue-logo.svg';
import simpletextLogo from 'calypso/assets/images/illustrations/simpletext-logo.png';
import verblioLogo from 'calypso/assets/images/illustrations/verblio-logo.png';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import {
	marketingConnections,
	marketingBusinessTools,
	marketingUltimateTrafficGuide,
} from 'calypso/my-sites/marketing/paths';
import { hasTrafficGuidePurchase } from 'calypso/my-sites/marketing/ultimate-traffic-guide';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import * as T from 'calypso/types';
import MarketingToolsFeature from './feature';
import MarketingToolsHeader from './header';

import './style.scss';

export const MarketingTools: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recordTracksEvent = ( event: string ) => dispatch( recordTracksEventAction( event ) );

	const selectedSiteSlug: T.SiteSlug | null = useSelector( getSelectedSiteSlug );
	const purchases = useSelector( getUserPurchases );
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const sitePlan = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ) || '';
	const showFacebookUpsell = [ 'value_bundle', 'personal-bundle', 'free_plan' ].includes(
		sitePlan
	);

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

	const handleFacebookClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_facebook_button_click' );
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

	const handleSimpleTextingClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_simpletexting_button_click' );
	};

	const handleStartSharingClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_start_sharing_button_click' );

		page( marketingConnections( selectedSiteSlug ) );
	};

	const handleUltimateTrafficGuideClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_ultimate_traffic_guide_button_click' );

		page( marketingUltimateTrafficGuide( selectedSiteSlug ) );
	};

	const isEnglish = ( config( 'english_locales' ) as string[] ).includes( getLocaleSlug() ?? '' );

	return (
		<Fragment>
			<QueryUserPurchases />
			{ ! sitePlan && <QuerySitePlans siteId={ siteId } /> }
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingToolsHeader handleButtonClick={ handleBusinessToolsClick } />

			<div className="tools__feature-list">
				<MarketingToolsFeature
					title={ translate( 'Want to build a great brand? Start with a great logo' ) }
					description={ translate(
						'A custom logo helps your brand pop and makes your site memorable. Make a professional logo in a few clicks with our partner today.'
					) }
					imagePath={ fiverrLogo }
				>
					<Button
						onClick={ handleCreateALogoClick }
						href="https://wp.me/logo-maker/?utm_campaign=marketing_tab"
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
						title={ translate( 'Want to connect with your audience on Facebook and Instagram?' ) }
						description={ translate(
							'Discover an easy way to advertise your brand across Facebook and Instagram. Capture website actions to help you target audiences and measure results. {{em}}Available on Pro plan{{/em}}.',
							{
								components: {
									em: <em />,
								},
							}
						) }
						imagePath={ facebookLogo }
					>
						{ ! showFacebookUpsell && (
							<Button
								onClick={ handleFacebookClick }
								href="https://wordpress.com/plugins/official-facebook-pixel"
								target="_blank"
							>
								{ translate( 'Add Facebook for WordPress.com' ) }
							</Button>
						) }
						{ showFacebookUpsell && (
							<Button
								onClick={ handleFacebookClick }
								href={ `/plans/${ selectedSiteSlug }?customerType=business` }
							>
								{ translate( 'Unlock this feature' ) }
							</Button>
						) }
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
						onClick={ handleSimpleTextingClick }
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
						'Verblio makes blog and content creation happen. Its writers can help create high-powered content for your website that drives SEO. Get 35% off your first month today.'
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
							{ hasTrafficGuidePurchase( purchases )
								? translate( 'Download now' )
								: translate( 'Learn more' ) }
						</Button>
					</MarketingToolsFeature>
				) }
			</div>
		</Fragment>
	);
};

export default MarketingTools;
