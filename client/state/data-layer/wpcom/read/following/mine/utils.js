/**
 * External Dependencies
 */
import { isArray, isUndefined, map, omitBy } from 'lodash';

/**
 * Internal Dependencies
 */
import { toValidId } from 'calypso/reader/id-helpers';

export const isValidApiResponse = ( apiResponse ) => {
	const hasSubscriptions =
		apiResponse && apiResponse.subscriptions && isArray( apiResponse.subscriptions );
	return hasSubscriptions;
};

export const subscriptionFromApi = ( subscription ) =>
	subscription &&
	omitBy(
		{
			ID: Number( subscription.ID ),
			URL: subscription.URL,
			feed_URL: subscription.URL,
			blog_ID: toValidId( subscription.blog_ID ),
			feed_ID: toValidId( subscription.feed_ID ),
			date_subscribed: Date.parse( subscription.date_subscribed ),
			delivery_methods: subscription.delivery_methods,
			is_owner: subscription.is_owner,
			organization_id: subscription.organization_id,
			name: subscription.name,
			unseen_count: subscription.unseen_count,
			site_icon: subscription.site_icon,
		},
		isUndefined
	);

export const subscriptionsFromApi = ( apiResponse ) => {
	if ( ! isValidApiResponse( apiResponse ) ) {
		return [];
	}
	return map( apiResponse.subscriptions, subscriptionFromApi );
};
