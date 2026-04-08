import { SiteDetails } from '@automattic/data-stores';
import { useMemo } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import SiteLaunchCelebrationModal from 'calypso/dashboard/sites/site-launch-celebration-modal';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const CelebrateSiteLaunchModal = ( {
	site,
	onOpen,
	onModalClosed,
}: {
	site: SiteDetails | null | undefined;
	onOpen?: () => void;
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
			{ site && (
				<SiteLaunchCelebrationModal site={ site } onOpen={ onOpen } onClose={ onModalClosed } />
			) }
		</AnalyticsProvider>
	);
};
