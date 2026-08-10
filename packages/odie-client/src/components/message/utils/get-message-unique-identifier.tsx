import { Message } from '../../../types';

export const getMessageUniqueIdentifier = ( message: Message, fallback?: string ) => {
	// Raw Zendesk-sourced messages (zendeskMessageConverter spreads the original ZendeskMessage)
	// carry their own `id`, even though it isn't declared on the `Message` type. Falling through
	// to `fallback` for these -- as opposed to an id-having message -- means an unstable,
	// per-render-regenerated key (see clusterMessagesBySender's group.id), which remounts the
	// message on every render instead of just the ones that actually change.
	const zendeskMessageId = 'id' in message ? ( message as { id?: string } ).id : undefined;

	return (
		message.metadata?.temporary_id ??
		message.message_id ??
		message.internal_message_id ??
		message.id ??
		message.metadata?.local_timestamp ??
		zendeskMessageId ??
		fallback
	);
};
