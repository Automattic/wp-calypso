import Markdown from 'react-markdown';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import type { ReactNode } from 'react';

interface IntroductionMessageProps {
	content: ReactNode;
}

export const IntroductionMessage = ( { content }: IntroductionMessageProps ) => (
	<div className="odie-introduction-message-content">
		<div className="odie-chatbox-introduction-message">
			{ typeof content === 'string' ? (
				<Markdown
					urlTransform={ uriTransformer }
					components={ {
						a: CustomALink,
					} }
				>
					{ content }
				</Markdown>
			) : (
				content
			) }
		</div>
	</div>
);
