import { useOdieAssistantContext } from '../../../context';
import { useSendChatMessage } from '../../../hooks';
import type { Message } from '../../../types';

export type QuickReply = {
	id: string;
	text: string;
};

export const QuickReplyOptions = ( { options }: { options: QuickReply[] } ) => {
	const { trackEvent, chat } = useOdieAssistantContext();
	const { sendMessage } = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';

	const handleOptionClick = ( option: QuickReply ) => {
		if ( isChatBusy ) {
			return;
		}

		trackEvent( 'chat_quick_reply_selected', {
			option,
			provider: chat?.provider,
		} );

		const messageObj: Message = {
			content: option.text,
			role: 'user',
			type: 'message',
		};

		return sendMessage( messageObj );
	};

	return (
		<ul className="odie-introduction-quick-reply-options">
			{ options.map( ( option ) => (
				<li key={ option.id } className="odie-introduction-quick-reply-option">
					<button
						onClick={ () => handleOptionClick( option ) }
						disabled={ isChatBusy }
						type="button"
					>
						{ option.text }
					</button>
				</li>
			) ) }
		</ul>
	);
};
