import { wpcom } from '../wpcom-fetcher';
import { MonetizeSubscriptionAutoRenewResponse, MonetizeSubscriptionStopResponse } from './types';

export const requestAutoRenewDisable = (
	subscriptionId: string
): Promise< MonetizeSubscriptionAutoRenewResponse > => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/auto_renew/disable` );
};

export const requestAutoRenewResume = (
	subscriptionId: string
): Promise< MonetizeSubscriptionAutoRenewResponse > => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/auto_renew/enable` );
};

export const requestSubscriptionStop = (
	subscriptionId: string
): Promise< MonetizeSubscriptionStopResponse > => {
	return wpcom.req.post( `/me/memberships/subscriptions/${ subscriptionId }/cancel` );
};
