import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import ChatHeaderView from './view';
import type { ChatHeaderProps, Options } from './view';

export type { Options };

type Props = Omit< ChatHeaderProps, 'hasAiChatEntry' >;

export default function ChatHeader( props: Props ) {
	const hasAiChatEntry = useHasAiChatEntryButton();

	return <ChatHeaderView { ...props } hasAiChatEntry={ hasAiChatEntry } />;
}
