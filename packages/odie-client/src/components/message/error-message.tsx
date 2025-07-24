import Markdown from 'react-markdown';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../../types';

export const ErrorMessage = ( { message }: { message: Message } ) => {
	return typeof message.content === 'string' ? (
		<Markdown urlTransform={ uriTransformer } components={ { a: CustomALink } }>
			{ message.content }
		</Markdown>
	) : (
		message.content
	);
};

export default ErrorMessage;
