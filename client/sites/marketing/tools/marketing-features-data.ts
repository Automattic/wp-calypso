import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getLocaleSlug } from 'i18n-calypso';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import rocket from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import earnIllustration from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import wordPressLogo from 'calypso/assets/images/icons/wordpress-logo.svg';
import { marketingConnections } from 'calypso/my-sites/marketing/paths';
import * as T from 'calypso/types';
import { MarketingToolsFeatureData } from './types';

export const getMarketingFeaturesData = (
	selectedSiteSlug: T.SiteSlug | null,
	translate: ( text: string ) => string,
	localizeUrl: ( url: string ) => string
): MarketingToolsFeatureData[] => {
	const isEnglish = ( config( 'english_locales' ) as string[] ).includes( getLocaleSlug() ?? '' );
	const result: MarketingToolsFeatureData[] = [
		{
			title: translate( 'Let our WordPress.com experts build your site!' ),
			description: translate(
				"Hire our dedicated experts to build a handcrafted, personalized website. Share some details about what you're looking for, and we'll make it happen."
			),
			categories: [ 'design', 'favourite' ],
			imagePath: wordPressLogo,
			buttonText: translate( 'Get started' ),
			buttonHref: localizeUrl( 'https://wordpress.com/website-design-service/?ref=tools-banner' ),
			buttonTarget: '_blank',
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_built_by_wp_button_click' );
			},
		},
		{
			title: translate( 'Monetize your site' ),
			description: translate(
				'Accept payments or donations with our native payment blocks, limit content to paid subscribers only, opt into our ad network to earn revenue, and refer friends to WordPress.com for credits.'
			),
			categories: [ 'monetize', 'favourite' ],
			imagePath: earnIllustration,
			imageAlt: translate( 'A stack of coins' ),
			buttonText: translate( 'Start earning' ),
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_earn_button_click' );

				page( `/earn/${ selectedSiteSlug }` );
			},
		},
		{
			title: translate( 'Fiverr logo maker' ),
			description: translate(
				'Create a standout brand with a custom logo. Our partner makes it easy and quick to design a professional logo that leaves a lasting impression.'
			),
			categories: [ 'design', 'new' ],
			imagePath: fiverrLogo,
			imageAlt: translate( 'Fiverr logo' ),
			buttonText: translate( 'Make your brand' ),
			buttonHref: 'https://wp.me/logo-maker/?utm_campaign=marketing_tab',
			buttonTarget: '_blank',
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_create_a_logo_button_click' );
			},
		},
		{
			title: translate( 'Hire an SEO expert' ),
			description: translate(
				'In today‘s digital age, visibility is key. Hire an SEO expert to boost your online presence and capture valuable opportunities.'
			),
			categories: [ 'seo', 'favourite' ],
			imagePath: fiverrLogo,
			imageAlt: translate( 'Fiverr logo' ),
			buttonText: translate( 'Talk to an SEO expert today' ),
			buttonHref: 'https://wp.me/hire-seo-expert/?utm_source=marketing_tab',
			buttonTarget: '_blank',
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_hire_an_seo_expert_button_click' );
			},
		},
		{
			title: translate( 'Get social, and share your blog posts where the people are' ),
			description: translate(
				"Use your site's Jetpack Social tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Facebook, LinkedIn, and more."
			),
			categories: [ 'share', 'new' ],
			imagePath: '/calypso/images/marketing/social-media-logos.svg',
			imageAlt: translate( 'Logos for Facebook, Twitter, LinkedIn, and Tumblr' ),
			buttonText: translate( 'Start sharing' ),
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_start_sharing_button_click' );

				page( marketingConnections( selectedSiteSlug ) );
			},
		},
	];
	if ( isEnglish ) {
		result.push( {
			title: translate( 'Increase traffic to your WordPress.com site' ),
			description: translate(
				'Take our free introductory course about search engine optimization (SEO) and learn how to improve your site or blog for both search engines and humans.'
			),
			categories: [ 'seo', 'new' ],
			imagePath: rocket,
			imageAlt: translate( 'A rocketship' ),
			buttonText: translate( 'Register now' ),
			buttonHref: 'https://wordpress.com/learn/courses/intro-to-seo/',
			buttonTarget: '_blank',
			onClick: () => {
				recordTracksEvent( 'calypso_marketing_tools_seo_course_button_click' );
			},
		} );
	}
	return result;
};
