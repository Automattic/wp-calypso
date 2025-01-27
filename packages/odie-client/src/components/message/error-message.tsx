import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../../types';

export const ErrorMessage = ( { message }: { message: Message } ) => {
	const { extraContactOptions } = useOdieAssistantContext();
	return (
		<>
			<Markdown urlTransform={ uriTransformer } components={ { a: CustomALink } }>
				{ message.content }
			</Markdown>
			{ extraContactOptions }
		</>
	);
};

export default ErrorMessage;
