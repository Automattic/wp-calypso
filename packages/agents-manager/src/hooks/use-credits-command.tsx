import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CreditsAnswer } from '../components/credits-answer';
import { CREDITS_COMMAND_MESSAGE_ID_PREFIX, isCreditsCommand } from '../utils/credits-command';
import { generateUUID } from '../utils/generate-uuid';
import type { UseCreditsResult } from './use-credits';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

interface UseCreditsCommandOptions {
	creditsAnswer: UseCreditsResult[ 'creditsAnswer' ];
	beforeSubmit: UseCreditsResult[ 'beforeSubmit' ];
	addMessage: UseAgentChatReturn[ 'addMessage' ];
	clearError: UseAgentChatReturn[ 'clearError' ];
}

/**
 * Answers `/credits` in the browser, so the command never reaches the model: no model call, no
 * credits spent, no usage added to the site. It exists because the answer is wanted most when the
 * balance is low or gone, and the credits gate would block that send. The answer is a UI-only
 * message: its id is not in the agent's client history, so it is never sent as history.
 *
 * Without a known live balance the command is not handled and goes out as any text does, rather
 * than invent a balance or claim a failure the site may not have (a 404 reads the same as a
 * site with no metering).
 */
export function useCreditsCommand( {
	creditsAnswer,
	beforeSubmit,
	addMessage,
	clearError,
}: UseCreditsCommandOptions ) {
	// Whether a send is handled here, read by the composer's gate and its send path alike.
	const handlesMessage = useCallback(
		( message: string ) => !! creditsAnswer && isCreditsCommand( message ),
		[ creditsAnswer ]
	);

	const handleCommand = useCallback(
		( message: string ) => {
			if ( ! creditsAnswer || ! isCreditsCommand( message ) ) {
				return false;
			}

			// Neither message is in the agent's client history, so neither is sent. The question shows
			// as the user's own bubble, which `isUiOnly` keeps when a later turn rebuilds the thread.
			// A failed send's error sits below the thread, so it would read as the answer's.
			clearError();
			const timestamp = Date.now();
			const id = generateUUID();
			addMessage( {
				id: `${ CREDITS_COMMAND_MESSAGE_ID_PREFIX }question-${ id }`,
				role: 'user',
				content: [ { type: 'text', text: message.trim() } ],
				timestamp,
				archived: false,
				showIcon: false,
				isUiOnly: true,
			} );
			addMessage( {
				id: `${ CREDITS_COMMAND_MESSAGE_ID_PREFIX }${ id }`,
				role: 'agent',
				content: [
					{
						type: 'text',
						text: __( 'Here’s where your site credits stand.', __i18n_text_domain__ ),
					},
					{
						type: 'component',
						// The thread renders a part's component with its `componentProps`, typed as none.
						component: CreditsAnswer as unknown as ComponentType,
						componentProps: { ...creditsAnswer, createdAt: timestamp },
					},
				],
				timestamp: timestamp + 1,
				archived: false,
				showIcon: true,
			} );
			return true;
		},
		[ creditsAnswer, addMessage, clearError ]
	);

	const beforeComposerSubmit = useCallback(
		( message?: string ) =>
			( message !== undefined && handlesMessage( message ) ) || beforeSubmit(),
		[ handlesMessage, beforeSubmit ]
	);

	return { handleCommand, beforeSubmit: beforeComposerSubmit };
}
