import './config';
import {
	HelpCenterChat as EmbeddedChat,
	HelpCenterRequiredContextProvider,
	HelpCenterSmooch,
} from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient();

export default function HelpCenterEmbeddedChat( { target = 'odie', ...rest } ) {
	const initialRoute = target === 'odie' ? '/odie' : '/odie?provider=zendesk';
	const initialEntries = useMemo( () => [ initialRoute ], [ initialRoute ] );

	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenterRequiredContextProvider value={ rest }>
				<HelpCenterSmooch enableAuth />
				<MemoryRouter initialEntries={ initialEntries } initialIndex={ 0 }>
					<Routes>
						<Route path="/odie" element={ <EmbeddedChat /> } />
					</Routes>
				</MemoryRouter>
			</HelpCenterRequiredContextProvider>
		</QueryClientProvider>
	);
}
