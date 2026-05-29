import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { hydrateRoot } from 'react-dom/client';
import OmnibarContainer from './omnibar';

export default function loadOmnibar() {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	hydrateRoot(
		container,
		<QueryClientProvider client={ queryClient }>
			<OmnibarContainer user={ window.currentUser } />
		</QueryClientProvider>
	);
}
