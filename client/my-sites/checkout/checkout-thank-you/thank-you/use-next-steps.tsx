import { ThankYouSectionProps, ThankYouNextStepProps } from 'calypso/components/thank-you/types';

export default function useNextSteps( footerSteps: FooterStep[] ): ThankYouNextStepProps[] {
	const siteId = useSelector( getSelectedSiteId );

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: pluginSlugs.join( '/' ),
				themes: themeSlugs.join( '/' ),
			} );
		},
		[ siteId ]
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
