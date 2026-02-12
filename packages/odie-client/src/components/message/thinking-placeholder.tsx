import { ThinkingMessage } from '@automattic/agenttic-ui';

export const ThinkingPlaceholder = ( { content }: { content?: string } ) => {
	return (
		<div
			className="odie-chatbox__action-message"
			ref={ ( div ) => div?.scrollIntoView( { behavior: 'smooth', block: 'end' } ) }
		>
			<div className="odie-chatbox-thinking-placeholder agenttic">
				<ThinkingMessage content={ content } />
			</div>
		</div>
	);
};
