import Markdown from 'react-markdown';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../../types';

export const ErrorMessage = ( { message }: { message: Message } ) => {
	return (
		<Markdown urlTransform={ uriTransformer } components={ { a: CustomALink } }>
			{ message.content }
		</Markdown>
	);
};

export default ErrorMessage;
