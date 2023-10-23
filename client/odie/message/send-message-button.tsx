import { Button } from '@wordpress/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { WAPUU_ERROR_MESSAGE } from '..';
import { useOdieAssistantContext } from '../context';
import { useOdieSendMessage } from '../query';
import { Message } from '../types';

import './style.scss';

export const SendMessageButton = ( {
	unencodedHref,
	children,
}: {
	unencodedHref: string;
	children: React.ReactNode;
} ) => {
	const { addMessage, setIsLoading } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const dispatch = useDispatch();
	return (
		<Button
			variant="primary"
			className="odie-chatbox-message-action-button"
			onClick={ async ( event: { preventDefault: () => void } ) => {
				try {
					event.preventDefault();
					dispatch(
						recordTracksEvent( 'calypso_odie_chat_message_action_click', {
							bot_name_slug: 'wapuu',
							action: 'prompt',
							href: unencodedHref,
						} )
					);
					const message = {
						content: unencodedHref,
						role: 'user',
						type: 'message',
					} as Message;

					addMessage( {
						content: message.content,
						role: 'user',
						type: 'message',
					} );
					setIsLoading( true );
					await sendOdieMessage( { message } );
				} catch ( e ) {
					addMessage( {
						content: WAPUU_ERROR_MESSAGE,
						role: 'bot',
						type: 'error',
					} );
				} finally {
					setIsLoading( false );
				}
			} }
		>
			{ children }
		</Button>
	);
};
