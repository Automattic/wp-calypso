import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import type { StepProps } from '../../types';
interface SiteLaunchStepProps extends StepProps {
	title?: string;
	subtitle?: string;
}

const SiteLaunchStep: React.FC< SiteLaunchStepProps > = function ( props ) {
	const { submit } = props.navigation;

	const { __ } = useI18n();

	const site = useSite();
	const { launchSite } = useDispatch( SITE_STORE );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const callLaunchSite = async () => {
		if ( site?.ID ) {
			setPendingAction( async () => {
				await launchSite( site.ID );
				await new Promise( ( res ) => setTimeout( res, 1000 ) );
				return { isLaunched: true, siteSlug: urlToSlug( site.URL ) };
			} );
			submit?.();
		}
	};

	useEffect( () => {
		callLaunchSite();
	}, [ site ] );

	return (
		<>
			<DocumentHead title={ __( 'Processing' ) } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="processing-step"
				stepContent={
					<>
						<div className="processing-step">
							<h1 className="processing-step__progress-step">{ __( 'Launching blog' ) }</h1>
							<LoadingEllipsis />
						</div>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteLaunchStep;
