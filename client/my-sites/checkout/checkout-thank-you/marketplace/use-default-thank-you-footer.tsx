import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
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
				stepIcon: <FooterIcon icon="next-page" />,
				stepKey: 'thank_you_footer_support_guides',
				stepTitle: translate( 'Support guides' ),
				stepDescription: translate(
					'Our guides will show you everything you need to know about plugins.'
				),
				stepCta: (
					<Button
						isSecondary
						href="https://wordpress.com/support/plugins/"
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_plugin_support_click' ) }
					>
						{ translate( 'Plugin Support' ) }
					</Button>
				),
			},
			{
				stepIcon: <FooterIcon icon="create" />,
				stepKey: 'thank_you_footer_explore',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you.'
				),
				stepCta: (
					<Button
						isPrimary
						href={ `/plugins/${ siteSlug }` }
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_explore_plugins_click' ) }
					>
						{ translate( 'Explore plugins' ) }
					</Button>
				),
			},
			{
				stepIcon: <FooterIcon icon="help-outline" />,
				stepKey: 'thank_you_footer_support',
				stepTitle: translate( 'How can we support you?' ),
				stepDescription: translate(
					'Our team is here if you need help, or if you have any questions.'
				),
				stepCta: (
					<Button
						isSecondary
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

function FooterIcon( { icon }: { icon: string } ) {
	return (
		<Gridicon
			className="marketplace-thank-you__footer-icon"
			size={ 18 }
			color="var(--studio-gray-30)"
			icon={ icon }
		/>
	);
}
