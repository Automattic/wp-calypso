import './config';
import {
	HelpCenterChat as EmbeddedChat,
	HelpCenterRequiredContextProvider,
	HelpCenterSmooch,
} from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import './embedded-chat.scss';
import './help-center.scss';

const queryClient = new QueryClient();

export default function HelpCenterEmbeddedChat( props ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenterRequiredContextProvider value={ props }>
				<HelpCenterSmooch enableAuth />
				<MemoryRouter>
					<Routes>
						<Route path="/odie" element={ <div>Hello</div> } />
						<Route path="/" element={ <EmbeddedChat /> } />
					</Routes>
				</MemoryRouter>
			</HelpCenterRequiredContextProvider>
		</QueryClientProvider>
	);
}
