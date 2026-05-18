import { siteLaunchMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/ui';
import { useExperiment } from 'calypso/lib/explat';
import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
};

/**
 * Call to action for the "launch site" task, shown inside the task's
 * expanded Launchpad card. Triggers the same launch flow as the
 * (now-removed) masterbar Launch button — explat-gated mutate-or-redirect.
 * On success it fires the celebrate-launch side effects; the modal itself
 * is a single hoisted instance rendered globally (since trunk PR #109896
 * unified it), triggered by the `celebrateLaunch` query param the
 * side-effects hook sets.
 */
export default function LaunchTaskCta( { task }: Props ) {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( ( state: AppState ) => ( siteId ? getSite( state, siteId ) : null ) );
	const { onSiteLaunched } = useCelebrateLaunchModalSideEffects( siteId ?? 0 );

	const launchSiteMutation = useMutation( {
		...siteLaunchMutation( siteId ?? 0 ),
		onSuccess: () => onSiteLaunched( !! site?.is_wpcom_atomic ),
	} );

	const [ isLoading, data ] = useExperiment( 'calypso_standardized_site_launch_gating' );
	const disabled = ! siteId || isLoading || launchSiteMutation.isPending;

	const onClick = () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( recordTracksEvent( 'calypso_launchpad_launch_site' ) );

		if ( data?.variationName === 'gated_site_launch' ) {
			window.location.assign( `/start/launch-site?siteSlug=${ site?.slug }` );
			return;
		}
		if ( data?.variationName === 'ungated_site_launch' ) {
			launchSiteMutation.mutate();
			return;
		}
		dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) );
	};

	return (
		<Button
			variant="solid"
			tone="brand"
			onClick={ onClick }
			disabled={ disabled }
			loading={ launchSiteMutation.isPending }
		>
			{ task.cta }
		</Button>
	);
}
