import './config';
import {
	HelpCenterRequiredContextProvider,
	HelpCenterContent,
	PersistentRouter,
} from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
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
		<PersistentRouter>
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
					<HelpCenterContent currentRoute="/bigsky" />
				</HelpCenterRequiredContextProvider>
			</QueryClientProvider>
		</PersistentRouter>
	);
}
