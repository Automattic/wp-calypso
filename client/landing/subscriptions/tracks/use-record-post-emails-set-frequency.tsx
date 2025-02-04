import { Reader } from '@automattic/data-stores';
import useRecordSubscriptionsTracksEvent from './use-record-subscriptions-tracks-event';

const useRecordPostEmailsSetFrequency = () => {
	const recordSubscriptionsTracksEvent = useRecordSubscriptionsTracksEvent();

	const recordPostEmailsSetFrequency = ( tracksProps: {
		blog_id: string | null;
		delivery_frequency: Reader.EmailDeliveryFrequency;
	} ) => {
		recordSubscriptionsTracksEvent(
			'calypso_subscriptions_post_emails_set_frequency',
			tracksProps
		);
	};

	return recordPostEmailsSetFrequency;
};

export default useRecordPostEmailsSetFrequency;
