import { HelpCenterSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { HELP_CENTER_STORE } from '../../constants';
import { TypingPlaceholder } from './typing-placeholder';

type ZendeskTypingIndicatorProps = {
	conversationId: string | null | undefined;
};

/**
 * Isolated component for Zendesk typing indicator.
 * This component subscribes to the typing status store independently,
 * preventing unnecessary rerenders of MessagesContainer when typing status changes.
 */
export const ZendeskTypingIndicator = ( { conversationId }: ZendeskTypingIndicatorProps ) => {
	const typingStatus = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getSupportTypingStatus(
				conversationId ?? ''
			),
		[ conversationId ]
	);

	if ( ! typingStatus ) {
		return null;
	}

	return (
		<div
			className="odie-chatbox__action-message"
			ref={ ( div ) => div?.scrollIntoView( { behavior: 'smooth', block: 'end' } ) }
		>
			<TypingPlaceholder />
		</div>
	);
};
