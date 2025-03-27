import type { Message } from '../types';

/**
 * Check if the user provided enough information to proceed with the conversation with Happiness Engineers.
 * @param messages - List of Message objects
 * @returns boolean
 */
export const userProvidedEnoughInformation = ( messages: Message[] ): boolean => {
	const insufficientEnums = new Set(
		[
			'Other (everything else)',
			'User just said hi, hello or similar',
			'User wanted to speak with an agent/human',
		].map( ( tag ) => tag.toLowerCase() )
	);

	// Extract category from each message's context.question_tags and normalize to lowercase
	return messages.some( ( message ) => {
		const category = message.context?.question_tags?.category?.toLowerCase();
		return category && ! insufficientEnums.has( category );
	} );
};
