import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ThankYouSectionProps, ThankYouNextStepProps } from 'calypso/components/thank-you/types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export function useDefaultThankYouFoooter( slugs: string[] ): ThankYouSectionProps {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const footerSteps: FooterStep[] = [
		{
			key: 'thank_you_footer_support_guides',
			title: translate( 'Support guides' ),
			description: translate(
				'Our guides will show you everything you need to know about plugins.'
			),
			link: 'https://wordpress.com/support/plugins/',
			linkText: translate( 'Plugin Support' ),
			eventKey: 'calypso_plugin_thank_you_plugin_support_click',
		},
		{
			key: 'thank_you_footer_explore',
			title: translate( 'Keep growing' ),
			description: translate(
				'Take your site to the next level. We have all the solutions to help you.'
			),
			link: `/plugins/${ siteSlug }`,
			linkText: translate( 'Explore plugins' ),
			eventKey: 'calypso_plugin_thank_you_explore_plugins_click',
		},
		{
			key: 'thank_you_footer_support',
			title: translate( 'How can we support you?' ),
			description: translate( 'Our team is here if you need help, or if you have any questions.' ),
			link: 'https://wordpress.com/help/contact',
			linkText: translate( 'Ask a question' ),
			eventKey: 'calypso_plugin_thank_you_ask_question_click',
		},
	];
	const steps = useNextSteps( slugs, footerSteps );

	return {
		sectionKey: 'thank_you_footer',
		nextStepsClassName: 'thank-you__footer',
		nextSteps: steps,
	};
}

function useNextSteps( slugs: string[], footerSteps: FooterStep[] ): ThankYouNextStepProps[] {
	const siteId = useSelector( getSelectedSiteId );

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: slugs.join( '/' ),
			} );
		},
		[ siteId, slugs ]
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
					target="_blank"
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
};
