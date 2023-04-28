import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ThankYouSectionProps, ThankYouNextStepProps } from 'calypso/components/thank-you/types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export function useThankYouFoooter(
	pluginSlugs: Array< string >,
	themeSlugs: Array< string >
): ThankYouSectionProps {
	const [ hasPlugins, hasThemes ] = [ pluginSlugs, themeSlugs ].map(
		( slugs ) => slugs.length !== 0
	);

	const [ pluginExploreStep, pluginSupportStep ] = usePluginSteps();
	const [ themeSupportStep, WordPressForumStep ] = useThemeSteps();

	/**
	 * Base case: multiple product types
	 */
	let footerSteps: FooterStep[] = [ pluginExploreStep, pluginSupportStep, WordPressForumStep ];

	/**
	 * If only plugins are present
	 */
	if ( hasPlugins && ! hasThemes ) {
		footerSteps = [ pluginExploreStep, pluginSupportStep, themeSupportStep ];
	}

	/**
	 * If only themes are present
	 */
	if ( ! hasPlugins && hasThemes ) {
		footerSteps = [ themeSupportStep, WordPressForumStep, pluginExploreStep ];
	}

	const steps = useNextSteps( footerSteps, pluginSlugs, themeSlugs );

	return {
		sectionKey: 'thank_you_footer',
		nextStepsClassName: 'thank-you__footer',
		nextSteps: steps.slice( 0, 3 ),
	};
}

function usePluginSteps(): FooterStep[] {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return [
		{
			key: 'thank_you_footer_explore',
			title: translate( 'Keep growing' ),
			description: translate(
				'Take your site to the next level. We have all the solutions to help you.'
			),
			link: `/plugins/${ siteSlug }`,
			linkText: translate( 'Explore plugins' ),
			eventKey: 'calypso_plugin_thank_you_explore_plugins_click',
			blankTarget: false,
		},
		{
			key: 'thank_you_footer_support_guides',
			title: translate( 'Learn More' ),
			description: translate( 'Discover everything you need to know about Plugins.' ),
			link: 'https://wordpress.com/support/plugins/',
			linkText: translate( 'Plugin Support' ),
			eventKey: 'calypso_plugin_thank_you_plugin_support_click',
		},
	];
}

function useThemeSteps(): FooterStep[] {
	const translate = useTranslate();

	return [
		{
			key: 'thank_you_footer_support_guides_themes',
			title: translate( 'Learn About Themes' ),
			description: translate( 'Discover everything you need to know about Themes.' ),
			link: 'https://wordpress.com/support/themes/',
			linkText: translate( 'Theme Support' ),
			eventKey: 'calypso_plugin_thank_you_theme_support_click',
		},
		{
			key: 'thank_you_footer_forum',
			title: translate( 'WordPress community' ),
			description: translate( 'Have a question about this theme? Get help from the community.' ),
			link: 'https://wordpress.com/forums/',
			linkText: translate( 'Visit Forum' ),
			eventKey: 'calypso_plugin_thank_you_forum_click',
		},
	];
}

function useNextSteps(
	footerSteps: FooterStep[],
	pluginSlugs: Array< string >,
	themeSlugs: Array< string >
): ThankYouNextStepProps[] {
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
			stepKey: step.key,
			stepTitle: step.title,
			stepDescription: step.description,
			stepCta: (
				<Button
					isLink
					href={ step.link }
					target={ step.blankTarget !== false ? '_blank' : undefined } // the default is to open in a new tab
					onClick={ () => sendTrackEvent( step.eventKey ) }
				>
					{ step.linkText }
				</Button>
			),
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
