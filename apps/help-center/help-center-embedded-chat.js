import './config';
import {
	HelpCenterChat as EmbeddedChat,
	HelpCenterRequiredContextProvider,
} from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import './help-center.scss';

const queryClient = new QueryClient();

export default function HelpCenterEmbeddedChat( {
	locale,
	sectionName,
	currentUser,
	site,
	hasPurchases,
	onboardingUrl = 'https://wordpress.com/start',
	isCommerceGarden,
} ) {
	return (
		<MemoryRouter>
			<Routes>
				<Route path="/odie" element={ <div>Hello</div> } />
				<Route
					path="/"
					element={
						<QueryClientProvider client={ queryClient }>
							<HelpCenterRequiredContextProvider
								locale={ locale }
								sectionName={ sectionName || 'wp-admin' }
								currentUser={ currentUser }
								site={ site }
								hasPurchases={ hasPurchases }
								onboardingUrl={ onboardingUrl }
								isCommerceGarden={ isCommerceGarden }
							>
								<EmbeddedChat isLoadingStatus={ false } isUserEligibleForPaidSupport={ false } />
							</HelpCenterRequiredContextProvider>
						</QueryClientProvider>
					}
				/>
			</Routes>
		</MemoryRouter>
	);
}
