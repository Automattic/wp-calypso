import { domainsQuery } from '@automattic/api-queries';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useSiteLaunch, type A4aLaunchModalComponent } from './use-site-launch';
import type { Site } from '@automattic/api-core';

export function SiteLaunchButton( {
	site,
	tracksContext,
	launchUrl,
	LaunchModal,
	flowDestination,
}: {
	site: Site;
	tracksContext: string;
	launchUrl?: string;
	LaunchModal?: A4aLaunchModalComponent;
	flowDestination?: string;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const { isLoading, isExperimentLoading, isHidden, isDisabled, isBusy, href, onClick, modal } =
		useSiteLaunch( site, {
			tracksContext,
			flowDestination,
			a4aLaunchUrl: launchUrl,
			a4aLaunchModal: LaunchModal,
			domainsOptions: domainsQuery(),
			recordTracksEvent,
		} );

	if ( isLoading || isHidden ) {
		return null;
	}

	return (
		<>
			<Button
				size="compact"
				variant="primary"
				disabled={ isDisabled || isExperimentLoading }
				isBusy={ isBusy }
				href={ href }
				onClick={ onClick }
			>
				{ __( 'Launch your site' ) }
			</Button>
			{ modal }
		</>
	);
}
