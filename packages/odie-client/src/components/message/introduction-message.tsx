import { MarkdownOrChildren } from './mardown-or-children';
import type { Message } from '../../types';

export const IntroductionMessage = ( { content }: { content: Message[ 'content' ] } ) => (
	<div className="odie-introduction-message-content">
		<div className="odie-chatbox-introduction-message">
			<MarkdownOrChildren messageContent={ content } />
		</div>
	</div>
);
