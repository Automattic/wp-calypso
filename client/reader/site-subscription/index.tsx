import SiteSubscription, { SiteSubscriptionProps } from './site-subscription';

export default ( { blogId, subscriptionId, transition }: SiteSubscriptionProps ) => {
	return (
		<SiteSubscription
			blogId={ blogId }
			subscriptionId={ subscriptionId }
			transition={ transition }
		/>
	);
};
