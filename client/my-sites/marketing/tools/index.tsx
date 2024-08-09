import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import { Fragment, FunctionComponent } from 'react';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import rocket from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import earnIllustration from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import wordPressLogo from 'calypso/assets/images/icons/wordpress-logo.svg';
import simpletextLogo from 'calypso/assets/images/illustrations/simpletext-logo.png';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { marketingConnections, pluginsPath } from 'calypso/my-sites/marketing/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
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

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( pluginsPath( selectedSiteSlug ) );
	};

	const handleEarnClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_earn_button_click' );

		page( `/earn/${ selectedSiteSlug }` );
	};

	const handleBuiltByWpClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_built_by_wp_button_click' );
	};

	const handleCreateALogoClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_create_a_logo_button_click' );
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
					title={ translate( 'Let our WordPress.com experts build your site!' ) }
					description={ translate(
						"Hire our dedicated experts to build a handcrafted, personalized website. Share some details about what you're looking for, and we'll make it happen."
					) }
					imagePath={ wordPressLogo }
				>
					<Button
						onClick={ handleBuiltByWpClick }
						href={ localizeUrl( 'https://wordpress.com/website-design-service/?ref=tools-banner' ) }
						target="_blank"
					>
						{ translate( 'Get started' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Fiverr logo maker' ) }
					description={ translate(
						'Create a standout brand with a custom logo. Our partner makes it easy and quick to design a professional logo that leaves a lasting impression.'
					) }
					imagePath={ fiverrLogo }
					imageAlt={ translate( 'Fiverr logo' ) }
				>
					<Button
						onClick={ handleCreateALogoClick }
						href="https://wp.me/logo-maker/?utm_campaign=marketing_tab"
						target="_blank"
					>
						{ translate( 'Make your brand' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Monetize your site' ) }
					description={ translate(
						'Accept payments or donations with our native payment blocks, limit content to paid subscribers only, opt into our ad network to earn revenue, and refer friends to WordPress.com for credits.'
					) }
					imagePath={ earnIllustration }
					imageAlt={ translate( 'A stack of coins' ) }
				>
					<Button onClick={ handleEarnClick }>{ translate( 'Start earning' ) }</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Get social, and share your blog posts where the people are' ) }
					description={ translate(
						"Use your site's Jetpack Social tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Facebook, LinkedIn, and more."
					) }
					imagePath="/calypso/images/marketing/social-media-logos.svg"
					imageAlt={ translate( 'Logos for Facebook, Twitter, LinkedIn, and Tumblr' ) }
				>
					<Button onClick={ handleStartSharingClick }>{ translate( 'Start sharing' ) }</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'SimpleTexting' ) }
					description={ translate(
						'SimpleTexting makes it easy, fast and affordable to send SMS marketing campaigns or engage in 1-on-1 conversations with your customers.'
					) }
					imagePath={ simpletextLogo }
					imageAlt={ translate( 'SimpleTexting logo' ) }
				>
					<Button
						onClick={ handleSimpleTextingClick }
						href="https://simpletexting.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Start texting' ) }
					</Button>
				</MarketingToolsFeature>

				{ isEnglish && (
					<MarketingToolsFeature
						title={ translate( 'Increase traffic to your WordPress.com site' ) }
						description={ translate(
							'Take our free introductory course about search engine optimization (SEO) and learn how to improve your site or blog for both search engines and humans.'
						) }
						imagePath={ rocket }
						imageAlt={ translate( 'A rocketship' ) }
					>
						<Button
							onClick={ handleSEOCourseClick }
							href="https://wordpress.com/learn/courses/intro-to-seo/"
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
