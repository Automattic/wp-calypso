import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { SendMessageButton } from './send-message-button';

import './style.scss';

// This component will be extended in the future to support other types of links.
// For now, it only supports prompt:// links. But in the future might be more protocols like:
// - navigate:// to navigate within calypso
// - choice:// to send a message to the bot based on the user's choice
// - confirm:// to send a message to the bot based on the user's confirmation
// - etc.
const CustomALink = ( { href, children }: { href: string; children: React.ReactNode } ) => {
	const isPrompt = href.startsWith( 'prompt://' );
	const dispatch = useDispatch();

	const unencodedHref = decodeURIComponent( href.replace( 'prompt://', '' ) );

	if ( isPrompt ) {
		return <SendMessageButton unencodedHref={ unencodedHref }>{ children }</SendMessageButton>;
	}
	return (
		<a
			href={ href }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				dispatch(
					recordTracksEvent( 'calypso_odie_chat_message_action_click', {
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
