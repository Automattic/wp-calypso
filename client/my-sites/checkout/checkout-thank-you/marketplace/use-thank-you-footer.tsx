import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

export function useThankYouFoooter(
	pluginSlugs: Array< string >,
	themeSlugs: Array< string >
): ThankYouFooterDetailProps[] {
	const [ hasPlugins, hasThemes ] = [ pluginSlugs, themeSlugs ].map(
		( slugs ) => slugs.length !== 0
	);

	const [ pluginExploreStep, pluginSupportStep ] = usePluginSteps();
	const [ themeSupportStep, WordPressForumStep ] = useThemeSteps();

	/**
	 * Base case: multiple product types
	 */
	let footerSteps: FooterStep[] = [ pluginExploreStep, themeSupportStep ];

	/**
	 * If only plugins are present
	 */
	if ( hasPlugins && ! hasThemes ) {
		footerSteps = [ pluginExploreStep, pluginSupportStep ];
	}

	/**
	 * If only themes are present
	 */
	if ( ! hasPlugins && hasThemes ) {
		footerSteps = [ themeSupportStep, WordPressForumStep ];
	}

	return useNextSteps( footerSteps, pluginSlugs, themeSlugs );
}

function usePluginSteps(): FooterStep[] {
	const localizeUrl = useLocalizeUrl();
	const translate = useTranslate();

	const descriptionText = translate(
		'Check out our support documentation for step-by-step instructions and expert guidance on your plugin setup.'
	);

	return [
		{
			key: 'thank_you_footer_explore',
			title: translate( 'Need help setting your plugin up?' ),
			description: descriptionText,
			link: localizeUrl( 'https://wordpress.com/support/plugins/use-your-plugins/' ),
			linkText: translate( 'Plugin setup guide' ),
			eventKey: 'calypso_plugin_thank_you_explore_plugins_click',
			blankTarget: false,
		},
		{
			key: 'thank_you_footer_support_guides',
			title: translate( 'All-in-one plugin documentation' ),
			description: translate(
				`Unlock your plugin's potential with our comprehensive support documentation.`
			),
			link: localizeUrl( 'https://wordpress.com/support/category/plugins-and-integrations/' ),
			linkText: translate( 'Plugin documentation' ),
			eventKey: 'calypso_plugin_thank_you_plugin_support_click',
		},
	];
}

function useThemeSteps(): FooterStep[] {
	const localizeUrl = useLocalizeUrl();
	const translate = useTranslate();

	return [
		{
			key: 'thank_you_footer_setup_guides_themes',
			title: translate( 'Need help setting up your theme?' ),
			description: translate(
				'Check out our support documentation for step-by-step instructions and expert guidance on your theme set up.'
			),
			link: localizeUrl( 'https://wordpress.com/support/themes/set-up-your-theme/' ),
			linkText: translate( 'Get set up support' ),
			eventKey: 'calypso_plugin_thank_you_theme_setup_guide_click',
		},
		{
			key: 'thank_you_footer_support_guides_themes',
			title: translate( 'Your go-to theme resource' ),
			description: translate(
				'Take a look at our comprehensive support documentation and learn more about themes.'
			),
			link: localizeUrl( 'https://wordpress.com/support/themes/' ),
			linkText: translate( 'Learn more about themes' ),
			eventKey: 'calypso_plugin_thank_you_theme_support_click',
		},
	];
}

function useNextSteps(
	footerSteps: FooterStep[],
	pluginSlugs: Array< string >,
	themeSlugs: Array< string >
): ThankYouFooterDetailProps[] {
	const siteId = useSelector( getSelectedSiteId );

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: pluginSlugs.join( '/' ),
				themes: themeSlugs.join( '/' ),
			} );
		},
		[ siteId, pluginSlugs, themeSlugs ]
	);

	return footerSteps.map( ( step ) => {
		return {
			key: step.key,
			title: step.title,
			description: step.description,
			buttonText: step.linkText,
			buttonHref: step.link,
			buttonOnClick: () => sendTrackEvent( step.eventKey ),
		};
	} );
}

type FooterStep = {
	key: string;
	title: string;
	description: string;
	link: string;
	linkText: string;
	eventKey: string;
	blankTarget?: boolean;
};
