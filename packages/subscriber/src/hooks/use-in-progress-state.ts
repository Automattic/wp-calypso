import { useSelect } from '@wordpress/data';
import { SUBSCRIBER_STORE } from '../store';
import type { SubscriberSelect } from '@automattic/data-stores';

export function useInProgressState() {
	const { addSelector, importSelector } = useSelect( ( select ) => {
		const subscriber: SubscriberSelect = select( SUBSCRIBER_STORE );
		return {
			addSelector: subscriber.getAddSubscribersSelector(),
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	return addSelector?.inProgress || importSelector?.inProgress;
}
