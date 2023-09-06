import ReaderSiteSubscription from 'calypso/blocks/reader-site-subscription';
import SiteSubscriptionProvider from './site-subscription-provider';
const SiteSubscription = ( { subscriptionId }: { subscriptionId: number } ) => {
	return (
		<SiteSubscriptionProvider subscriptionId={ subscriptionId }>
			<ReaderSiteSubscription />
		</SiteSubscriptionProvider>
	);
};

export default SiteSubscription;
