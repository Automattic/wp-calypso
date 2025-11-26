import { __ } from '@wordpress/i18n';
import cx from 'clsx';
import { Fragment } from 'react';
import ChatMessage from '..';
import { useOdieAssistantContext } from '../../../context';
import { isCSATMessage, isOdieMessage } from '../../../utils';
import {
	hasFeedbackForm,
	isAttachment,
	isTransitionToSupportMessage,
	isZendeskIntroMessage,
} from '../../../utils/csat';
import ChatWithSupportLabel from '../../chat-with-support';
import { getMessageUniqueIdentifier } from '../utils/get-message-unique-identifier';
import type { Message, MessageRole } from '../../../types';
import './style.scss';

// Message roles that should be excluded from rendering
const EXCLUDED_MESSAGE_ROLES = [ 'zendesk-intro' ] as const;

/**
 * Returns the presented role of a message. Replace CSAT messages's role with 'csat' role.
 * @param message - The message to get the presented role of.
 * @returns The presented role of the message.
 */
function getPresentedRole( message: Message ) {
	if ( isCSATMessage( message ) ) {
		return 'csat';
	} else if ( isAttachment( message ) ) {
		return 'attachment';
	} else if ( hasFeedbackForm( message ) ) {
		return 'feedback';
	} else if ( isZendeskIntroMessage( message ) ) {
		return 'zendesk-intro';
	}
	return message.role;
}

/**
 * Smooch sorts the messages by `received` timestamp. This TS is assigned on the server. So it requires a successfully-sent message to be present and accurate. But for messages that are automatically resent on connection recovery, it will be too late.
 * For that, we use the `local_timestamp` metadata to sort the messages. Which is independent of connection status.
 * @param messages
 * @returns
 */
function sortMessagesByTimestamp( messages: Message[] ) {
	return messages.sort( ( a, b ) => {
		// Within same type, sort by timestamp (local_timestamp preferred over received)
		const aTimestamp = a.metadata?.local_timestamp || a.received;
		const bTimestamp = b.metadata?.local_timestamp || b.received;

		if ( ! aTimestamp || ! bTimestamp ) {
			return 0;
		}

		return aTimestamp - bTimestamp;
	} );
}

/**
 * Clusters messages by sender.
 * @param messages - The messages to cluster.
 * @returns The clustered messages.
 */
function clusterMessagesBySender( messages: Message[] ) {
	if ( ! messages.length ) {
		return [];
	}

	let currentGroup: {
		id: string;
		role: MessageRole | 'csat' | 'attachment' | 'feedback' | 'zendesk-intro';
		messages: Message[];
	} = {
		id: crypto.randomUUID(),
		role: getPresentedRole( messages[ 0 ] ),
		messages: [],
	};

	const groups = [ currentGroup ];

	for ( const message of sortMessagesByTimestamp( messages ) ) {
		if ( EXCLUDED_MESSAGE_ROLES.includes( getPresentedRole( message ) as any ) ) {
			continue;
		}

		if ( getPresentedRole( message ) !== currentGroup.role ) {
			currentGroup = {
				id: crypto.randomUUID(),
				role: getPresentedRole( message ),
				messages: [],
			};
			groups.push( currentGroup );
		}

		currentGroup.messages.push( message );
	}

	return groups;
}

export function MessagesClusterizer( { messages }: { messages: Message[] } ) {
	const groups = clusterMessagesBySender( messages );
	const { currentUser } = useOdieAssistantContext();

	return groups.map( ( group ) => {
		const startingHumanSupport = group.messages.some( isTransitionToSupportMessage );
		const endingHumanSupport = group.messages.some( isCSATMessage );

		const messageHeader = () => {
			// Only business messages have a header.
			if ( group.role === 'business' ) {
				return (
					<div className="message-header business">
						{ __( 'Happiness Engineer', __i18n_text_domain__ ) }
					</div>
				);
			}
			return null;
		};

		return (
			<Fragment key={ group.id }>
				{ endingHumanSupport && (
					<ChatWithSupportLabel
						labelText={ __( 'Chat with support team ended', __i18n_text_domain__ ) }
					/>
				) }
				<div className={ cx( 'odie-chatbox-messages-cluster', `role-${ group.role }` ) }>
					{ group.messages.map( ( message, index ) => (
						<ChatMessage
							key={ getMessageUniqueIdentifier( message, `${ group.id }-${ index }` ) }
							message={ message }
							currentUser={ currentUser }
							header={ index === 0 ? messageHeader() : undefined }
						/>
					) ) }
				</div>
				{ startingHumanSupport && (
					<ChatWithSupportLabel
						labelText={ __( 'Chat with support team started', __i18n_text_domain__ ) }
					/>
				) }
			</Fragment>
		);
	} );
}
