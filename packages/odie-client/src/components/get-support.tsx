import { useSmooch } from '@automattic/zendesk-client';
import { useOdieAssistantContext } from '../context';

import './get-support.scss';

export const GetSupport = () => {
	const { setProvider, addMessage, chat, selectedSiteId } = useOdieAssistantContext();
	const { createConversation } = useSmooch();

	const handleOnClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		addMessage( {
			content: "We're connecting you to our support team.",
			role: 'bot',
			type: 'message',
		} );
		setProvider( 'zendesk' );

		createConversation?.(
			{
				messaging_initial_message: 'TESTING ZENDESK STUFF',
				/**
				 * Site ID of the site the user is currently on.
				 */
				messaging_site_id: selectedSiteId || null,
			},
			{
				odieChatId: chat.chat_id,
			}
		);
	};

	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>Get instant support</button>
			<button onClick={ handleOnClick }>Hear back soon</button>
		</div>
	);
};
