import type {
	FeedbackActionsConfig,
	MessageActionDefinition,
	UIMessage,
} from '../react/useAgentChat';

export interface FeedbackActionsManager {
	getActionsForMessage: ( message: UIMessage ) => MessageActionDefinition[];
	clearFeedback: ( messageId: string ) => void;
	clearAllFeedback: () => void;
	onChange: ( listener: () => void ) => void;
	offChange: ( listener: () => void ) => void;
}

/**
 * Creates a stateful feedback actions manager that tracks feedback state internally
 *
 * @param config - Configuration for feedback actions
 * @return FeedbackActionsManager with methods to get actions and manage state
 */
export const createFeedbackActions = (
	config: FeedbackActionsConfig
): FeedbackActionsManager => {
	const baseCondition = config.condition || ( () => true );
	const feedbackByMessageId: Record< string, 'up' | 'down' > = {};
	const changeListeners: Array< () => void > = [];

	const notifyListeners = () => {
		changeListeners.forEach( ( listener ) => listener() );
	};

	const handleFeedback = async (
		messageId: string,
		feedback: 'up' | 'down'
	) => {
		feedbackByMessageId[ messageId ] = feedback;
		await config.onFeedback( messageId, feedback );
		// Notify all listeners that state has changed
		notifyListeners();
	};

	return {
		getActionsForMessage: (
			message: UIMessage
		): MessageActionDefinition[] => {
			if ( ! baseCondition( message ) ) {
				return [];
			}

			const feedbackState = feedbackByMessageId[ message.id ];

			const actions: MessageActionDefinition[] = [];

			// Add thumbs up if not hidden
			if ( feedbackState !== 'down' ) {
				actions.push( {
					id: 'feedback-up',
					icon: config.icons.up,
					label: 'Good response',
					onClick: async () => {
						await handleFeedback( message.id, 'up' );
					},
					tooltip: 'This response was helpful',
					disabled: feedbackState === 'up',
				} );
			}

			// Add thumbs down if not hidden
			if ( feedbackState !== 'up' ) {
				actions.push( {
					id: 'feedback-down',
					icon: config.icons.down,
					label: 'Bad response',
					onClick: async () => {
						await handleFeedback( message.id, 'down' );
					},
					tooltip: 'This response was not helpful',
					disabled: feedbackState === 'down',
				} );
			}

			return actions;
		},

		clearFeedback: ( messageId: string ) => {
			delete feedbackByMessageId[ messageId ];
			notifyListeners();
		},

		clearAllFeedback: () => {
			Object.keys( feedbackByMessageId ).forEach( ( key ) => {
				delete feedbackByMessageId[ key ];
			} );
			notifyListeners();
		},

		onChange: ( listener: () => void ) => {
			changeListeners.push( listener );
		},

		offChange: ( listener: () => void ) => {
			const index = changeListeners.indexOf( listener );
			if ( index > -1 ) {
				changeListeners.splice( index, 1 );
			}
		},
	};
};
