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
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { marketingConnections, pluginsPath } from 'calypso/my-sites/marketing/paths';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
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
	const siteId = useSelector( getSelectedSiteId ) || 0;

	const facebookPluginInstalled = useSelector( ( state ) =>
		getPluginOnSite( state, siteId, 'official-facebook-pixel' )
	);

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( pluginsPath( selectedSiteSlug ) );
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

	const handleSEOCourseClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_seo_course_button_click' );
	};

	const isEnglish = ( config( 'english_locales' ) as string[] ).includes( getLocaleSlug() ?? '' );

	return (
		<Fragment>
			<QueryJetpackPlugins siteIds={ [ siteId ] } />
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

				{ ! facebookPluginInstalled && (
					<MarketingToolsFeature
						title={ translate( 'Want to connect with your audience on Facebook and Instagram?' ) }
						description={ translate(
							'Discover an easy way to advertise your brand across Facebook and Instagram. Capture website actions to help you target audiences and measure results. {{em}}Available on Business and eCommerce plans{{/em}}.',
							{
								components: {
									em: <em />,
								},
							}
						) }
						imagePath={ facebookLogo }
					>
						<Button
							onClick={ handleFacebookClick }
							href={ `/plugins/official-facebook-pixel/${ selectedSiteSlug }` }
						>
							{ translate( 'Add Facebook for WordPress.com' ) }
						</Button>
					</MarketingToolsFeature>
				) }

				<MarketingToolsFeature
					title={ translate( 'Monetize your site' ) }
					description={ translate(
						'Accept payments or donations with our native payment blocks, limit content to paid subscribers only, opt into our ad network to earn revenue, and refer friends to WordPress.com for credits.'
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
						title={ translate( 'Increase traffic to your WordPress.com site' ) }
						description={ translate(
							'Take our free introductory course about search engine optimization (SEO) and learn how to improve your site or blog for both search engines and humans.'
						) }
						imagePath={ rocket }
					>
						<Button
							onClick={ handleSEOCourseClick }
							href="https://wpcourses.com/course/intro-to-search-engine-optimization-seo/"
							target="_blank"
						>
							{ translate( 'Register now' ) }
						</Button>
					</MarketingToolsFeature>
				) }
			</div>
		</Fragment>
	);
};

export default MarketingTools;
