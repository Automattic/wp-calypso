import SiteSubscription from './site-subscription';

export default ( { subscriptionId }: { subscriptionId: number } ) => {
	return <SiteSubscription subscriptionId={ subscriptionId } />;
};
