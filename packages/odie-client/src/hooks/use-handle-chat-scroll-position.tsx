import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch } from '@wordpress/data';
import { RefObject, useEffect, useRef } from 'react';
import { NavigationType, useNavigationType } from 'react-router-dom';

export const useHandleChatScrollPosition = (
	messagesContainerRef: RefObject< HTMLDivElement >,
	shouldAutoScroll: boolean
) => {
	const { setOdieChatScrollPosition } = useDispatch( HELP_CENTER_STORE );
	const navType: NavigationType = useNavigationType();
	const scrollParentRef = useRef< HTMLElement | null >( null );

	if ( messagesContainerRef.current ) {
		scrollParentRef.current = messagesContainerRef.current.closest(
			'.help-center__container-content'
		);
	}

	useEffect( () => {
		if ( shouldAutoScroll ) {
			return;
		}

		const chatContainer = scrollParentRef.current;

		const handleScroll = () => {
			if ( chatContainer && navType !== 'POP' ) {
				setOdieChatScrollPosition( chatContainer.scrollTop );
			}
		};

		if ( chatContainer ) {
			chatContainer.addEventListener( 'scroll', handleScroll );
		}

		return () => {
			if ( chatContainer ) {
				chatContainer.removeEventListener( 'scroll', handleScroll );
			}
		};
	}, [] );
};
