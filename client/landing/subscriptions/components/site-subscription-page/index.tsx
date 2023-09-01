import { SubscriptionProvider } from './site-subscription-context';
import SiteSubscription from './site-subscription-page';

export const SiteSubscriptionPage = () => {
	return (
		<SubscriptionProvider>
			<SiteSubscription />
		</SubscriptionProvider>
	);
};
