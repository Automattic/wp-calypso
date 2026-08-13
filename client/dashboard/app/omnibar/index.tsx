import { queryClient } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClientProvider } from '@tanstack/react-query';
import { hydrateRoot } from 'react-dom/client';
import { AnalyticsProvider } from '../analytics';
import { AppProvider } from '../context';
import OmnibarContainer from './omnibar';
import type { AnalyticsClient } from '../analytics';
import type { AppConfig } from '../context';

const analyticsClient: AnalyticsClient = {
	recordTracksEvent,
	recordPageView: () => {},
};

export default function loadOmnibar( config: AppConfig ) {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	hydrateRoot(
		container,
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AnalyticsProvider client={ analyticsClient }>
					<OmnibarContainer user={ window.currentUser } />
				</AnalyticsProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
