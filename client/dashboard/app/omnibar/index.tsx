import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { hydrateRoot } from 'react-dom/client';
import { AppProvider } from '../context';
import OmnibarContainer from './omnibar';
import type { AppConfig } from '../context';

export default function loadOmnibar( config: AppConfig ) {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	hydrateRoot(
		container,
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<OmnibarContainer user={ window.currentUser } />
			</QueryClientProvider>
		</AppProvider>
	);
}
