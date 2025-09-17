import { __ } from '@wordpress/i18n';
import cx from 'clsx';
import { Fragment } from 'react';
import ChatMessage from '..';
import { useOdieAssistantContext } from '../../../context';
import { isCSATMessage } from '../../../utils';
import { hasFeedbackForm, isAttachment, isTransitionToSupportMessage } from '../../../utils/csat';
import ChatWithSupportLabel from '../../chat-with-support';
import type { Message, MessageRole } from '../../../types';
import './style.scss';

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
	}
	return message.role;
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
	let id = 0;

	let currentGroup: {
		id: number;
		role: MessageRole | 'csat' | 'attachment' | 'feedback';
		messages: Message[];
	} = {
		id: id++,
		role: getPresentedRole( messages[ 0 ] ),
		messages: [],
	};

	const groups = [ currentGroup ];

	for ( const message of messages ) {
		if ( getPresentedRole( message ) !== currentGroup.role ) {
			currentGroup = {
				id: ++id,
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
				<div
					key={ group.id }
					className={ cx( 'odie-chatbox-messages-cluster', `role-${ group.role }` ) }
				>
					{ group.messages.map( ( message, index ) => (
						<ChatMessage
							key={ message.message_id || index }
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
