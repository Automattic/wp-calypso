import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import SiteLaunchCelebrationModal from 'calypso/dashboard/sites/site-launch-celebration-modal';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { setSiteLaunchCelebrationModalOpen } from 'calypso/state/sites/launch/actions';
import { useReduxSiteWithQueryClientLaunchStatusSync } from './use-redux-site-with-query-client-launch-status-sync';

function CelebrateSiteLaunchModalContent( { siteId }: { siteId: number } ) {
	const site = useReduxSiteWithQueryClientLaunchStatusSync( siteId );

	const dispatch = useDispatch();
	const analyticsClient = useMemo( () => {
		return {
			recordTracksEvent,
			recordPageView() {}, // Unused by this component
		};
	}, [] );

	return (
		<AnalyticsProvider client={ analyticsClient }>
			{ site && (
				<SiteLaunchCelebrationModal
					site={ site }
					onOpen={ () => {
						dispatch( setSiteLaunchCelebrationModalOpen( true ) );
					} }
					onClose={ () => {
						dispatch( setSiteLaunchCelebrationModalOpen( false ) );
					} }
				/>
			) }
		</AnalyticsProvider>
	);
}

export default function CelebrateSiteLaunchModal( { siteId }: { siteId: number } ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<CelebrateSiteLaunchModalContent siteId={ siteId } />
		</QueryClientProvider>
	);
}
