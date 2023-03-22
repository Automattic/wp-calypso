import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export function useDefaultThankYouFoooter( slugs: string[] ): ThankYouSectionProps {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: slugs.join( '/' ),
			} );
		},
		[ siteId, slugs ]
	);

	return {
		sectionKey: 'thank_you_footer',
		nextStepsClassName: 'thank-you__footer',
		nextSteps: [
			{
				stepKey: 'thank_you_footer_explore',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you.'
				),
				stepCta: (
					<Button
						isLink
						href={ `/plugins/${ siteSlug }` }
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_explore_plugins_click' ) }
					>
						{ translate( 'Explore plugins' ) }
					</Button>
				),
			},
			{
				stepKey: 'thank_you_footer_support_guides',
				stepTitle: translate( 'Learn More' ),
				stepDescription: translate( 'Discover everything you need to know about Plugins.' ),
				stepCta: (
					<Button
						isLink
						href="https://wordpress.com/support/plugins/"
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_plugin_support_click' ) }
					>
						{ translate( 'Plugin Support' ) }
					</Button>
				),
			},
			{
				stepKey: 'thank_you_footer_support',
				stepTitle: translate( '24/7 support at your fingertips' ),
				stepDescription: translate( 'Our happiness engineers are eager to lend a hand.' ),
				stepCta: (
					<Button
						isLink
						href="https://wordpress.com/help/contact"
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_ask_question_click' ) }
					>
						{ translate( 'Ask a question' ) }
					</Button>
				),
			},
		],
	};
}
