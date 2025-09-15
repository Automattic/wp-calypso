import { wpcom } from '../wpcom-fetcher';

export const requestAutoRenewDisable = ( subscriptionId: string ) => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/auto_renew/disable` );
};

export const requestAutoRenewResume = ( subscriptionId: string ) => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/auto_renew/enable` );
};

export const requestSubscriptionStop = ( subscriptionId: string ) => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/cancel` );
};
