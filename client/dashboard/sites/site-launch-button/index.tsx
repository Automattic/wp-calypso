import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import { useSiteLaunch, type A4aLaunchModalComponent } from './use-site-launch';
import type { Site } from '@automattic/api-core';

export function SiteLaunchButton( {
	site,
	tracksContext,
	launchUrl,
	LaunchModal,
	backTo,
}: {
	site: Site;
	tracksContext: string;
	launchUrl?: string;
	LaunchModal?: A4aLaunchModalComponent;
	backTo?: string;
} ) {
	const { queries } = useAppContext();
	const { recordTracksEvent } = useAnalytics();

	const { isLoading, isExperimentLoading, isHidden, isDisabled, isBusy, href, onClick, modal } =
		useSiteLaunch( site, {
			tracksContext,
			backTo,
			a4aLaunchUrl: launchUrl,
			a4aLaunchModal: LaunchModal,
			domainsOptions: queries.domainsQuery(),
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
