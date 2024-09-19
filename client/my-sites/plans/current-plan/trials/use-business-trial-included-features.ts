import page from '@automattic/calypso-router';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import advancedDesignTools from 'calypso/assets/images/plans/wpcom/business-trial/advanced-design-tools.svg';
import beautifulThemes from 'calypso/assets/images/plans/wpcom/business-trial/beautiful-themes.svg';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/business-trial/best-in-class-hosting.svg';
import googleAnalytics from 'calypso/assets/images/plans/wpcom/business-trial/google-analytics.svg';
import jetpackBackupsAndRestores from 'calypso/assets/images/plans/wpcom/business-trial/jetpack-backups-and-restores.svg';
import newsletters from 'calypso/assets/images/plans/wpcom/business-trial/newsletters.svg';
import seoTools from 'calypso/assets/images/plans/wpcom/business-trial/seo-tools.svg';
import spamProtection from 'calypso/assets/images/plans/wpcom/business-trial/spam-protection.svg';
import type { SiteSlug } from 'calypso/types';

export default function useBusinessTrialIncludedFeatures(
	siteSlug: SiteSlug,
	siteAdminUrl: string
) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	return [
		{
			id: 'themes',
			title: translate( 'Beautiful themes' ),
			text: translate( 'Set your site apart with professionally designed themes and layouts.' ),
			illustration: beautifulThemes,
			showButton: true,
			buttonText: translate( 'Browse themes' ),
			buttonClick: () => page( `/themes/${ siteSlug }` ),
		},
		{
			id: 'advanced-design-tools',
			title: hasEnTranslation( 'Advanced design tools' )
				? translate( 'Advanced design tools' )
				: translate( 'Advanced Design Tools' ),
			text: translate(
				'Make your site even more unique with extended color schemes, typography, and control over your site’s CSS.'
			),
			illustration: advancedDesignTools,
			showButton: true,
			buttonText: translate( 'Design your blog' ),
			buttonClick: () => ( location.href = siteAdminUrl + 'site-editor.php' ),
		},
		{
			id: 'newsletters',
			title: translate( 'Newsletters' ),
			text: translate(
				'Send your new posts directly to your subscriber’s inbox, add monetization options, and create a community.'
			),
			illustration: newsletters,
			showButton: true,
			buttonText: translate( 'Setup a newsletter' ),
			buttonClick: () => ( location.href = `/setup/newsletter/intro?siteSlug=${ siteSlug }` ),
		},
		{
			id: 'jetpack-backups-and-restores',
			title: translate( 'Jetpack backups and restores' ),
			text: translate(
				'Easily restore or download a backup of your site from any moment in time.'
			),
			illustration: jetpackBackupsAndRestores,
			showButton: true,
			buttonText: translate( 'View your backup activity' ),
			buttonClick: () => page( `/backup/${ siteSlug }` ),
		},
		{
			id: 'spam-protection',
			title: translate( 'Spam protection' ),
			text: translate(
				'Keep your site free of unwelcome comment, form, and text spam with Akismet.'
			),
			illustration: spamProtection,
			showButton: true,
			buttonText: translate( 'Keep your site safe' ),
			buttonClick: () =>
				( location.href = `//${ siteSlug.replace(
					'::',
					'/'
				) }/wp-admin/admin.php?page=akismet-key-config` ),
		},
		{
			id: 'seo-tools',
			title: translate( 'SEO tools' ),
			text: translate( 'Boost traffic by making your content more findable on search engines.' ),
			illustration: seoTools,
			showButton: true,
			buttonText: translate( 'Increase visibility' ),
			buttonClick: () => page( `/marketing/traffic/${ siteSlug }` ),
		},
		{
			id: 'google-analytics',
			title: translate( 'Google Analytics' ),
			text: translate( 'Access in-depth data on how and why people come to your site.' ),
			illustration: googleAnalytics,
			showButton: true,
			buttonText: translate( 'Connect Google Analytics' ),
			buttonClick: () => page( `/marketing/traffic/${ siteSlug }#analytics` ),
		},
		{
			id: 'hosting',
			title: translate( 'Best-in-class hosting' ),
			text: translate( 'We take care of hosting your store so you can focus on selling.' ),
			illustration: bestInClassHosting,
			showButton: false,
		},
	];
}
