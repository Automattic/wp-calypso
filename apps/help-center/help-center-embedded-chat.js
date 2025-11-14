import './config';
import {
	HelpCenterChat as EmbeddedChat,
	HelpCenterRequiredContextProvider,
	HelpCenterSmooch,
} from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import './embedded-chat.scss';
import './help-center.scss';

const queryClient = new QueryClient();

export default function HelpCenterEmbeddedChat( { target = 'odie', ...rest } ) {
	const initialRoute = target === 'odie' ? '/odie' : '/odie?provider=zendesk';

	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenterRequiredContextProvider value={ rest }>
				<HelpCenterSmooch enableAuth />
				<MemoryRouter initialEntries={ [ initialRoute ] } initialIndex={ 0 }>
					<Routes>
						<Route path="/odie" element={ <EmbeddedChat /> } />
						<Route path="*" element={ <Navigate to={ initialRoute } replace /> } />
					</Routes>
				</MemoryRouter>
			</HelpCenterRequiredContextProvider>
		</QueryClientProvider>
	);
}
