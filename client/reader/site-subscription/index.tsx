import SiteSubscription, { SiteSubscriptionProps } from './site-subscription';

export default ( { blogId, subscriptionId }: SiteSubscriptionProps ) => {
	return <SiteSubscription blogId={ blogId } subscriptionId={ subscriptionId } />;
};
