import { __ } from '@wordpress/i18n';
import { monetizeSubscriptionsRoute } from '../../app/router/me';

export function getMonetizeSubscriptionUrl( subscriptionId: string ): string {
	return `/me/billing/monetize-subscriptions/${ subscriptionId }`;
}
export function getMonetizeSubscriptionsUrl(): string {
	return monetizeSubscriptionsRoute.to;
}

export function getMonetizeSubscriptionsPageTitle(): string {
	return __( 'Monetize subscriptions' );
}
