import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import type { ReactNode } from 'react';
import '../../styles/ai-chat-label.scss';

interface Props {
	/** The label text, named by the host. */
	children: ReactNode;
}

/**
 * The label a Calypso AI chat entry button shows beside its icon while the chat
 * is hidden. Hidden from assistive tech, since the button already carries that
 * name. wp-admin renders its label server-side.
 */
export default function AiChatEntryLabel( { children }: Props ) {
	const { hasLoaded, isChatVisible } = useAiChatEntryState();

	// Waits for the persisted state so it can't flash beside a chat about to restore open.
	if ( ! children || ! hasLoaded || isChatVisible ) {
		return null;
	}

	return (
		<span className="agents-manager-ai-chat-label is-revealed" aria-hidden="true">
			<span>{ children }</span>
		</span>
	);
}
