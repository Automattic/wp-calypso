import { useMemo } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import SiteLaunchCelebrationModal from 'calypso/dashboard/sites/site-launch-celebration-modal';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { setSiteLaunchCelebrationModalOpen } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';

const CelebrateSiteLaunchModal = ( { siteId }: { siteId: number } ) => {
	const site = useSelector( ( state ) => getSite( state, siteId ) );

	const dispatch = useDispatch();
	const analyticsClient = useMemo( () => {
		return {
			recordTracksEvent,
			recordPageView() {}, // Unused by this component
		};
	}, [] );

	const layout = useHomeLayoutQuery( siteId );

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
						layout?.refetch();
					} }
				/>
			) }
		</AnalyticsProvider>
	);
};

export default CelebrateSiteLaunchModal;
