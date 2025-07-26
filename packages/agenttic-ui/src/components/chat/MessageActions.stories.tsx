import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import { MessageActions } from './MessageActions';
import { Message } from './Message';
import messageStyles from './Message.module.css';
import {
	copyAction,
	createMessageWithActions,
	editAction,
	mockAgentMessage,
	mockLongAgentMessage,
	mockUserMessage,
	retryAction,
	shareAction,
} from '../../stories/mocks/messageActions';
import { ThumbsDownIcon, ThumbsUpIcon } from '..';
import type { Message as MessageType } from '../../types';

// Import client functionality for integration examples
import { createFeedbackActions } from '@automattic/agenttic-client';

const meta = {
	title: 'Chat/MessageActions',
	component: MessageActions,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'MessageActions displays contextual action buttons for chat messages.',
			},
		},
	},
} satisfies Meta< typeof MessageActions >;

export default meta;
type Story = StoryObj< typeof meta >;

// Story 1: Component in isolation
export const ComponentExample: Story = {
	args: {
		message: createMessageWithActions( mockAgentMessage, [
			copyAction,
			shareAction,
			editAction,
		] ),
	},
	render: ( args ) => (
		<div style={ { padding: '20px' } }>
			<MessageActions { ...args } />
		</div>
	),
};

// Story 2: Full integration with feedback actions
export const FeedbackExample: Story = {
	args: {
		message: mockAgentMessage,
	},
	render: () => {
		const FeedbackDemo = () => {
			const [ message, setMessage ] =
				useState< MessageType >( mockAgentMessage );
			const [ , forceUpdate ] = useState( {} );

			// Create feedback manager with ref to maintain instance
			const feedbackManagerRef =
				useRef< ReturnType< typeof createFeedbackActions > >();
			if ( ! feedbackManagerRef.current ) {
				feedbackManagerRef.current = createFeedbackActions( {
					onFeedback: async (
						messageId: string,
						feedback: 'up' | 'down'
					) => {
						console.log(
							`Feedback submitted: ${ messageId } - ${ feedback }`
						);
					},
					condition: ( msg: MessageType ) => msg.role === 'agent',
					icons: {
						up: <ThumbsUpIcon size={ 16 } />,
						down: <ThumbsDownIcon size={ 16 } />,
					},
				} );
			}
			const feedbackManager = feedbackManagerRef.current;

			// Initial setup
			useEffect( () => {
				const actions = feedbackManager.getActionsForMessage( message );
				setMessage( ( prev ) => ( { ...prev, actions } ) );
			}, [] );

			// Set up onChange listener
			useEffect( () => {
				const handleChange = () => {
					const actions =
						feedbackManager.getActionsForMessage( message );
					setMessage( ( prev ) => ( { ...prev, actions } ) );
				};

				feedbackManager.onChange( handleChange );
				return () => feedbackManager.offChange( handleChange );
			}, [] );

			return (
				<div>
					<Message message={ message } />
					<div style={ { marginTop: '10px' } }>
						<button
							onClick={ () => {
								feedbackManager.clearFeedback( message.id );
							} }
							style={ {
								padding: '5px 10px',
								fontSize: '12px',
								cursor: 'pointer',
							} }
						>
							Clear Feedback
						</button>
					</div>
				</div>
			);
		};

		return <FeedbackDemo />;
	},
};

// Story 3: Custom assistant message with actions
export const CustomAssistantMessage: Story = {
	args: {
		message: mockLongAgentMessage,
	},
	render: () => {
		const messageWithCustomIcon: MessageType = {
			...mockLongAgentMessage,
			icon: 'custom',
			actions: [ copyAction, shareAction, retryAction ],
		};

		return <Message message={ messageWithCustomIcon } />;
	},
};

// Story 4: Custom user message with edit action
export const CustomUserMessage: Story = {
	args: {
		message: mockUserMessage,
	},
	render: () => {
		const userMessageWithIcon: MessageType = {
			...mockUserMessage,
			showIcon: true,
			actions: [ editAction ],
		};

		// Custom implementation to show user message with actions below
		return (
			<div
				className={ messageStyles.message + ' ' + messageStyles.user }
				style={ {
					display: 'flex',
					alignItems: 'flex-start',
					padding: '0 12px',
				} }
			>
				<div
					style={ {
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-end',
					} }
				>
					<div
						style={ {
							backgroundColor: 'var(--color-muted)',
							maxWidth: '85%',
							padding: '12px 16px',
							borderRadius: '18px',
							borderBottomRightRadius: '4px',
							marginBottom: '4px',
						} }
					>
						{ userMessageWithIcon.content[ 0 ].text }
					</div>
					<MessageActions message={ userMessageWithIcon } />
				</div>
			</div>
		);
	},
};

// Story 5: Message without any actions
export const NoActions: Story = {
	args: {
		message: mockAgentMessage,
	},
	render: () => {
		return <Message message={ mockAgentMessage } />;
	},
	parameters: {
		docs: {
			description: {
				story: 'When a message has no actions defined, the MessageActions component returns null and nothing is rendered.',
			},
		},
	},
};

// Story 6: Message with disabled actions
export const DisabledActions: Story = {
	args: {
		message: mockAgentMessage,
	},
	render: () => {
		const messageWithDisabledActions = createMessageWithActions(
			mockAgentMessage,
			[
				{
					...copyAction,
					disabled: true,
					tooltip: 'Copy is currently disabled',
				},
				{
					id: 'feedback-up',
					label: 'Already liked',
					icon: <ThumbsUpIcon size={ 16 } />,
					onClick: () => console.log( 'This should not fire' ),
					disabled: true,
					tooltip: 'You already liked this message',
				},
			]
		);

		return <Message message={ messageWithDisabledActions } />;
	},
};
