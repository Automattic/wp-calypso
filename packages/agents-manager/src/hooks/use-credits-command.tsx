import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CreditsAnswer, CreditsMessage } from '../components/credits-answer';
import { CREDITS_COMMAND_MESSAGE_ID_PREFIX, isCreditsCommand } from '../utils/credits-command';
import { generateUUID } from '../utils/generate-uuid';
import type { UseCreditsResult } from './use-credits';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

interface UseCreditsCommandOptions {
	reply: UseCreditsResult[ 'creditsCommand' ];
	beforeSubmit: UseCreditsResult[ 'beforeSubmit' ];
	addMessage: UseAgentChatReturn[ 'addMessage' ];
	clearError: UseAgentChatReturn[ 'clearError' ];
}

function getReplyText( reply: NonNullable< UseCreditsResult[ 'creditsCommand' ] > ): string {
	switch ( reply.state ) {
		case 'balance':
			return __( 'Here’s where your site credits stand.', __i18n_text_domain__ );
		case 'stale':
			return __(
				'I couldn’t refresh your credits just now. This is the last balance I have.',
				__i18n_text_domain__
			);
		case 'loading':
			return __(
				'I’m still loading your site credits. Try again in a moment.',
				__i18n_text_domain__
			);
		case 'failed':
			return __(
				'I couldn’t check your site credits right now. Try again in a moment.',
				__i18n_text_domain__
			);
		case 'unmetered':
			return __(
				'This site has no AI credits, so there’s no balance to show.',
				__i18n_text_domain__
			);
	}
}

/**
 * Answers `/credits` in the browser, so the command never reaches the model: no model call, no
 * credits spent, no usage added to the site. It exists because the answer is wanted most when the
 * balance is low or gone, and the credits gate would block that send. The answer is a UI-only
 * message: its id is not in the agent's client history, so it is never sent as history.
 *
 * Every state of the balance read gets a local reply, so the command never costs a model call:
 * the balance, the last known balance after a failed read, still loading, failed with nothing
 * known, or a site with no AI credits. Only when credits are off or the balance is a mock is the
 * command not handled, and it goes out as any text does.
 */
export function useCreditsCommand( {
	reply,
	beforeSubmit,
	addMessage,
	clearError,
}: UseCreditsCommandOptions ) {
	// Whether a send is handled here, read by the composer's gate and its send path alike.
	const handlesMessage = useCallback(
		( message: string ) => !! reply && isCreditsCommand( message ),
		[ reply ]
	);

	const handleCommand = useCallback(
		( message: string ) => {
			if ( ! reply || ! isCreditsCommand( message ) ) {
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
					{ type: 'text', text: getReplyText( reply ) },
					'answer' in reply
						? {
								type: 'component',
								// The thread renders a part's component with its `componentProps`, typed as none.
								component: CreditsAnswer as unknown as ComponentType,
								componentProps: { ...reply.answer, createdAt: timestamp },
							}
						: {
								type: 'component',
								component: CreditsMessage as unknown as ComponentType,
								componentProps: { text: getReplyText( reply ), createdAt: timestamp },
							},
				],
				timestamp: timestamp + 1,
				archived: false,
				showIcon: true,
			} );
			return true;
		},
		[ reply, addMessage, clearError ]
	);

	const beforeComposerSubmit = useCallback(
		( message?: string ) =>
			( message !== undefined && handlesMessage( message ) ) || beforeSubmit(),
		[ handlesMessage, beforeSubmit ]
	);

	return { handleCommand, beforeSubmit: beforeComposerSubmit };
}
