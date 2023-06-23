import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SubscriptionManager } from '@automattic/data-stores';
import { useSubscriptionManagerContext } from '../components/subscription-manager-context';

const getSource = () => {
	const path = window.location.pathname;

	if ( path.indexOf( '/subscriptions/settings' ) === 0 ) {
		return 'subscription-settings';
	}

	if ( path.indexOf( '/subscriptions/comments' ) === 0 ) {
		return 'subscription-comments';
	}

	if ( path.indexOf( '/subscriptions/sites' ) === 0 || path.indexOf( '/subscriptions' ) === 0 ) {
		return 'subscriptions-sites';
	}

	if ( path.indexOf( '/read/subscriptions' ) === 0 ) {
		return 'reader-subscriptions-sites';
	}

	return 'unknown';
};

const useRecordSubscriptionsTracksEvent = () => {
	const { portal } = useSubscriptionManagerContext();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();

	const recordSubscriptionsTracksEvent = ( tracksEventName: string, tracksEventProps?: object ) => {
		const source = getSource();
		const subscription_count = counts?.blogs;

		return recordTracksEvent( tracksEventName, {
			source,
			portal,
			subscription_count,
			...tracksEventProps,
		} );
	};

	return recordSubscriptionsTracksEvent;
};

export default useRecordSubscriptionsTracksEvent;
