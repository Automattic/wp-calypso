import { RefObject, useEffect } from 'react';
import { useOdieAssistantContext } from './context';
import { Message } from './types/';

const useAutoScroll = (
	messagesContainerRef: RefObject< HTMLDivElement >,
	messages: Message[]
) => {
	const { isLoadingExistingChat } = useOdieAssistantContext();
	const lastMessage = messages[ messages.length - 1 ];
	const lastMessageType = lastMessage?.type;
	useEffect( () => {
		const messageCount = messages.length;
		if ( messageCount < 2 || isLoadingExistingChat ) {
			return;
		}

		const isLastErrorMessage = () => {
			if ( messagesContainerRef.current ) {
				const children = messagesContainerRef.current.children;
				const lastMessage = children[ children.length - 1 ];
				if ( ! lastMessage ) {
					return false;
				}
				return lastMessage.getAttribute( 'data-is-last-error-message' ) === 'true';
			}
			return false;
		};

		const isLastFeedbackMessage = () => {
			if ( messagesContainerRef.current ) {
				const children = messagesContainerRef.current.children;
				const lastMessage = children[ children.length - 1 ];
				if ( ! lastMessage ) {
					return false;
				}
				return lastMessage.getAttribute( 'data-is-last-feedback-message' ) === 'true';
			}
			return false;
		};

		const scrollToLastMessage = () => {
			if ( messagesContainerRef.current ) {
				let lastMessageRef: HTMLDivElement | null = null;
				if ( messagesContainerRef.current ) {
					lastMessageRef = messagesContainerRef.current.querySelector(
						'[data-is-last-message="true"]'
					);
				}
				const lastMessage = lastMessageRef;
				lastMessage?.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
			}
		};

		const scrollToLastUserMessage = () => {
			if ( messagesContainerRef.current ) {
				const lastUserMessage = messagesContainerRef.current.querySelector(
					'[data-is-last-user-message="true"]'
				);
				lastUserMessage?.scrollIntoView( {
					behavior: 'smooth',
					block: 'start',
					inline: 'nearest',
				} );
			}
		};

		if ( isLastErrorMessage() || isLastFeedbackMessage() ) {
			scrollToLastMessage();
		} else {
			scrollToLastUserMessage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ messages.length, lastMessageType, isLoadingExistingChat ] );
};

export default useAutoScroll;
