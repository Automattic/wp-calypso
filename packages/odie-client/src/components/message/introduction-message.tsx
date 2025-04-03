import Markdown from 'react-markdown';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';

interface IntroductionMessageProps {
	content: string;
}

export const IntroductionMessage = ( { content }: IntroductionMessageProps ) => (
	<div className="odie-introduction-message-content">
		<div className="odie-chatbox-introduction-message">
			<Markdown
				urlTransform={ uriTransformer }
				components={ {
					a: CustomALink,
				} }
			>
				{ content }
			</Markdown>
		</div>
	</div>
);
