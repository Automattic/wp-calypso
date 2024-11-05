import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { RefObject, useCallback, useRef, useEffect, useState } from 'react';
import { useOdieAssistantContext } from '../../context';

export const JumpToRecent = ( {
	containerReference,
}: {
	containerReference: RefObject< HTMLDivElement >;
} ) => {
	const { trackEvent, isMinimized, chat, chatStatus } = useOdieAssistantContext();
	const lastMessageRef = useRef< Element | null >( null );
	const [ isLastMessageVisible, setIsLastMessageVisible ] = useState( false );

	const jumpToRecent = useCallback( () => {
		if ( containerReference.current && chat.messages.length > 0 ) {
			const messages = containerReference.current?.querySelectorAll( '[data-is-message="true"]' );
			const lastMessage = messages?.length ? messages[ messages.length - 1 ] : null;
			lastMessage?.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
		}
		trackEvent( 'chat_jump_to_recent_click' );
	}, [ containerReference, trackEvent, chat.messages.length ] );

	useEffect( () => {
		if (
			! containerReference.current ||
			isMinimized ||
			chat.messages.length < 2 ||
			chatStatus !== 'loaded'
		) {
			return;
		}

		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				setIsLastMessageVisible( entry.isIntersecting );
			} );
		} );

		const messages = containerReference.current?.querySelectorAll( '[data-is-message="true"]' );
		const lastMessage = messages?.length ? messages[ messages.length - 1 ] : null;
		if ( lastMessage ) {
			lastMessageRef.current = lastMessage;
			observer.observe( lastMessage );
		}

		return () => {
			if ( lastMessageRef.current ) {
				observer.unobserve( lastMessageRef.current );
			}
		};
	}, [ chat.messages.length ] );

	if ( isMinimized || chat.messages.length < 2 || chatStatus !== 'loaded' ) {
		return null;
	}

	const className = clsx( 'odie-gradient-to-white', {
		'is-visible': ! isLastMessageVisible,
		'is-hidden': isLastMessageVisible,
	} );

	return (
		<div className={ className }>
			<button
				className="odie-jump-to-recent-message-button"
				disabled={ isLastMessageVisible }
				onClick={ jumpToRecent }
			>
				{ __( 'Jump to recent', __i18n_text_domain__ ) }
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
