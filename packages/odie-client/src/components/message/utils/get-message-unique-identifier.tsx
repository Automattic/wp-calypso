type MessageIDProps = {
	metadata?: Record< string, any >;
	message_id?: number;
	internal_message_id?: string;
};

export const getMessageUniqueIdentifier = ( message: MessageIDProps, fallback?: string ) => {
	return (
		message.metadata?.temporary_id ??
		message.message_id ??
		message.internal_message_id ??
		message.metadata?.local_timestamp ??
		fallback
	);
};
