import React, { useEffect, useRef } from 'react';
import type { UIMessage } from '@automattic/agenttic-client';
import {
	createFeedbackActions,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';

type RegisterMessageActions = ( registration: {
	id: string;
	actions: ( message: UIMessage ) => any[];
} ) => void;

/**
 * Registers thumbs up/down feedback actions on agent messages, with
 * pressed/disabled/toggle-off state managed by `createFeedbackActions`.
 *
 * @param registerMessageActions The `registerMessageActions` from `useAgentChat`.
 */
export function useDemoFeedback(
	registerMessageActions: RegisterMessageActions
) {
	const hasRegistered = useRef( false );

	useEffect( () => {
		if ( hasRegistered.current ) {
			return;
		}

		const feedbackManager = createFeedbackActions( {
			onFeedback: async (
				messageId: string,
				feedback: 'up' | 'down'
			) => {
				console.log(
					`Feedback for message ${ messageId }: ${ feedback }`
				);
			},
			condition: ( message: UIMessage ) => message.role === 'agent',
			icons: {
				up: <ThumbsUpIcon />,
				down: <ThumbsDownIcon />,
			},
		} );
		const feedbackRegistration = {
			id: 'demo-feedback',
			actions: ( message: UIMessage ) =>
				feedbackManager.getActionsForMessage( message ),
		};
		registerMessageActions( feedbackRegistration );

		// Re-register with a fresh identity so the UI re-renders pressed state.
		const handleFeedbackChange = () => {
			registerMessageActions( { ...feedbackRegistration } );
		};
		feedbackManager.onChange( handleFeedbackChange );

		hasRegistered.current = true;

		return () => {
			feedbackManager.offChange( handleFeedbackChange );
		};
	}, [ registerMessageActions ] );
}
