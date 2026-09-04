import { getMessageUniqueIdentifier } from '../components/message/utils/get-message-unique-identifier';
import type { Message } from '../types';

/**
 * A user message sent through Zendesk: only those carry a `temporary_id`, so Odie messages don't match.
 * @param message - The message to check.
 * @returns Whether the message is a Zendesk message sent by the user.
 */
export function isQueuedZendeskMessage( message: Message ) {
	return message.role === 'user' && !! message.metadata?.temporary_id;
}

/**
 * Deduplicate Zendesk messages by their unique identifier (the `temporary_id` for a
 * user message, the Smooch id otherwise).
 *
 * The same message can show up twice: the optimistic copy the composer adds and the
 * server's echo, a copy mirrored from another tab and the server's echo, or a queued
 * message and the re-downloaded history after a reconnect. On a collision the later
 * copy wins and replaces the earlier one in place, so the server's version (with its
 * id, timestamp and converted content) supersedes any placeholder. The one exception:
 * a confirmed message (`received` set) is never overwritten by an unsent copy.
 * @param messages - The messages to deduplicate, earliest first.
 * @returns The deduplicated messages, in their original order.
 */
export function deduplicateZDMessages( messages: Message[] ) {
	const distinctMessages: Message[] = [];
	const indexById = new Map< unknown, number >();

	for ( const message of messages ) {
		const id = getMessageUniqueIdentifier( message );
		const existingIndex = id ? indexById.get( id ) : undefined;

		if ( existingIndex === undefined ) {
			if ( id ) {
				indexById.set( id, distinctMessages.length );
			}
			distinctMessages.push( message );
			continue;
		}

		const existing = distinctMessages[ existingIndex ];
		if ( existing.received && ! message.received ) {
			continue;
		}
		distinctMessages[ existingIndex ] = message;
	}

	return distinctMessages;
}
