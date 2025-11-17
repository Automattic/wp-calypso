import { useOdieAssistantContext } from '../../../context';
import { useSendChatMessage } from '../../../hooks';
import type { Message } from '../../../types';
import './quick-reply-options.scss';

export const QuickReplyOptions = ( { options }: { options: string[] } ) => {
	const { trackEvent, chat } = useOdieAssistantContext();
	const { sendMessage } = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';

	const handleOptionClick = async ( option: string ) => {
		if ( isChatBusy ) {
			return;
		}

		trackEvent( 'chat_quick_reply_selected', {
			option,
			provider: chat?.provider,
		} );

		const messageObj: Message = {
			content: option,
			role: 'user',
			type: 'message',
		};

		try {
			await sendMessage( messageObj );
		} catch ( error ) {
			// Error handling is done in the sendMessage hook
		}
	};

	return (
		<div className="odie-quick-reply-options">
			{ options.map( ( option ) => (
				<button
					key={ option }
					className="odie-quick-reply-option"
					onClick={ () => handleOptionClick( option ) }
					disabled={ isChatBusy }
					type="button"
				>
					{ option }
				</button>
			) ) }
		</div>
	);
};
