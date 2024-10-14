import { useSmooch } from '@automattic/zendesk-client';
import { useOdieAssistantContext } from '../../context';
import './get-support.scss';

export const GetSupport = () => {
	const { setSupportProvider, addMessage, chat, selectedSiteId } = useOdieAssistantContext();
	const { createConversation } = useSmooch();

	const handleOnClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		addMessage( {
			content: "We're connecting you to our support team.",
			role: 'bot',
			type: 'message',
		} );
		setSupportProvider( 'zendesk' );

		createConversation?.(
			{
				messaging_initial_message: '',
				messaging_site_id: selectedSiteId || null,
				messaging_ai_chat_id: chat.chat_id as number,
			},
			{
				odieChatId: chat.chat_id,
			}
		);
	};

	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>Get support</button>
		</div>
	);
};
