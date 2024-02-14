import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export const useEducationLinksList = () => {
	const translate = useTranslate();

	return [
		{
			id: 'website_building',
			title: translate( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)' ),
			url: localizeUrl(
				'https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/'
			),
		},
		{
			id: 'customization',
			title: translate( "How to Use WordPress Plugins: The Complete Beginner's Guide" ),
			url: localizeUrl( 'https://wordpress.com/go/website-building/how-to-use-wordpress-plugins/' ),
		},
		{
			id: 'seo',
			title: translate( '17 Must-Have WordPress Plugins (Useful For All Sites)' ),
			url: localizeUrl(
				'https://wordpress.com/go/website-building/17-must-have-wordpress-plugins-useful-for-all-sites/'
			),
		},
	];
};

export const useFeaturesList = () => {
	const translate = useTranslate();

	return [
		{
			id: 'fully_managed',
			header: translate( 'Fully managed' ),
			text: translate(
				'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
			),
		},
		{
			id: 'community_plugins',
			header: translate( 'Thousands of plugins' ),
			text: translate(
				'From WordPress.com premium plugins to thousands more community-authored plugins, we’ve got you covered.'
			),
		},
		{
			id: 'flexible_pricing',
			header: translate( 'Flexible pricing' ),
			text: translate(
				'Pay yearly and save. Or keep it flexible with monthly premium plugin pricing. It’s entirely up to you.'
			),
		},
	];
};
