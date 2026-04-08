import { SiteDetails } from '@automattic/data-stores';
import { useMemo } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import SiteLaunchCelebrationModal from 'calypso/dashboard/sites/site-launch-celebration-modal';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const CelebrateSiteLaunchModal = ( {
	site,
	onModalClosed,
}: {
	site: SiteDetails | null | undefined;
	onModalClosed: () => void;
} ) => {
	const analyticsClient = useMemo( () => {
		return {
			recordTracksEvent,
			recordPageView() {}, // Unused by this component
		};
	}, [] );

	return (
		<AnalyticsProvider client={ analyticsClient }>
			{ site && <SiteLaunchCelebrationModal site={ site } onClose={ onModalClosed } /> }
		</AnalyticsProvider>
	);
};
