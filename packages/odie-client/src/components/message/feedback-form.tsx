import { CSATForm } from '@automattic/zendesk-client';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo } from 'react';
import { useSendZendeskMessageOnce } from '../../hooks';
import { Message, MessageAction } from '../../types';

type FeedbackFormProps = {
	chatFeedbackOptions: MessageAction[];
};

export const FeedbackForm = ( { chatFeedbackOptions }: FeedbackFormProps ) => {
	const { __ } = useI18n();
	const sendZendeskMessage = useSendZendeskMessageOnce();

	const ticketId = useMemo( () => {
		if ( ! chatFeedbackOptions.length ) {
			return null;
		}
		return chatFeedbackOptions[ 0 ]?.metadata?.ticket_id ?? null;
	}, [ chatFeedbackOptions ] );

	const onSendFeedback = useCallback(
		( score: 'good' | 'bad' ) => {
			const message: Message = {
				content:
					score === 'good'
						? __( 'Good 👍', __i18n_text_domain__ )
						: __( 'Needs improvement 👎', __i18n_text_domain__ ),
				payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
				metadata: {
					rated: true,
					temporary_id: crypto.randomUUID(),
					local_timestamp: Date.now() / 1000,
				},
				role: 'user',
				type: 'message',
			};
			sendZendeskMessage( message );
		},
		[ sendZendeskMessage, __ ]
	);

	return <CSATForm ticketId={ ticketId } onSendFeedback={ onSendFeedback } />;
};
