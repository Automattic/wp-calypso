import Markdown from 'react-markdown';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../../types';

export const MarkdownOrChildren = ( {
	/**
	 * The message content to render. Messages can be React nodes or strings. When they're strings, they're Markdown.
	 */
	messageContent,
	components = { a: CustomALink },
}: {
	messageContent: Message[ 'content' ];
	components?: React.ComponentProps< typeof Markdown >[ 'components' ];
} ) => {
	return typeof messageContent === 'string' ? (
		<Markdown urlTransform={ uriTransformer } components={ components }>
			{ messageContent }
		</Markdown>
	) : (
		messageContent
	);
};

export default MarkdownOrChildren;
