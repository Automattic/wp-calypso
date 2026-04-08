import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { InterimOmnibar } from './interim-omnibar';
import { useInterimOmnibarData } from './use-interim-omnibar-data';
import type { OmnibarEvents } from './click-handlers';
import type { User } from '@automattic/api-core';

interface InterimOmnibarContainerProps {
	initialUser: User | null;
	events: OmnibarEvents;
}

function InterimOmnibarDataProvider( props: InterimOmnibarContainerProps ) {
	const data = useInterimOmnibarData( props );
	return <InterimOmnibar { ...data } />;
}

export function InterimOmnibarContainer( props: InterimOmnibarContainerProps ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<InterimOmnibarDataProvider { ...props } />
		</QueryClientProvider>
	);
}
