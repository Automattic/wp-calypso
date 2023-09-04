import SiteSubscription from 'calypso/blocks/reader-site-subscription';
import { SiteSubscriptionProvider } from './site-subscription-provider';

export const SiteSubscriptionPage = () => (
	<SiteSubscriptionProvider>
		<SiteSubscription />
	</SiteSubscriptionProvider>
);
