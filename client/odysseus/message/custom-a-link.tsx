import { Button } from '@automattic/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { WAPUU_ERROR_MESSAGE } from '..';
import { useOdysseusAssistantContext } from '../context';
import { useOddyseusSendMessage } from '../query';
import { Message } from '../types';

import './style.scss';

// This component will be extended in the future to support other types of links.
// For now, it only supports prompt:// links. But in the future might be more protocols like:
// - navigate:// to navigate within calypso
// - choice:// to send a message to the bot based on the user's choice
// - confirm:// to send a message to the bot based on the user's confirmation
// - etc.
const CustomALink = ( { href, children }: { href: string; children: React.ReactNode } ) => {
	const isPrompt = href.startsWith( 'prompt://' );
	const { addMessage, setIsLoading } = useOdysseusAssistantContext();
	const { mutateAsync: sendOdysseusMessage } = useOddyseusSendMessage();
	const dispatch = useDispatch();

	const unencodedHref = decodeURIComponent( href.replace( 'prompt://', '' ) );

	if ( isPrompt ) {
		return (
			<Button
				borderless
				className="odysseus-chatbox-message-action-button"
				primary
				onClick={ async ( event: { preventDefault: () => void } ) => {
					try {
						event.preventDefault();
						dispatch(
							recordTracksEvent( 'calypso_odysseus_chat_message_action_click', {
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
						await sendOdysseusMessage( { message } );
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
	}
	return (
		<a
			href={ href }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				dispatch(
					recordTracksEvent( 'calypso_odysseus_chat_message_action_click', {
						bot_name_slug: 'wapuu',
						action: 'link',
						href: href,
					} )
				);
			} }
		>
			{ children }
		</a>
	);
};

export default CustomALink;
