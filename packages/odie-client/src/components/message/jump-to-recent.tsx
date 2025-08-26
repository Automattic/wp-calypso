import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { useOdieAssistantContext } from '../../context';

const SCROLL_THRESHOLD = 100;

export const JumpToRecent = ( {
	containerReference,
}: {
	containerReference: RefObject< HTMLDivElement >;
} ) => {
	const { trackEvent, isMinimized, chat } = useOdieAssistantContext();
	const scrollParent = containerReference.current;

	const [ needsScrolling, setNeedsScrolling ] = useState(
		Boolean(
			scrollParent &&
				scrollParent.scrollTop + scrollParent.offsetHeight <
					scrollParent.scrollHeight - SCROLL_THRESHOLD
		)
	);

	useEffect( () => {
		function handleScroll( event: Event ) {
			if ( event.target !== scrollParent ) {
				return;
			}

			if ( scrollParent ) {
				setNeedsScrolling(
					scrollParent.scrollTop + scrollParent.offsetHeight <
						scrollParent.scrollHeight - SCROLL_THRESHOLD
				);
			}
		}

		window.addEventListener( 'scroll', handleScroll, true );

		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [ scrollParent ] );

	const jumpToRecent = useCallback( () => {
		scrollParent?.scrollTo( {
			top: scrollParent.scrollHeight,
			behavior: 'smooth',
		} );

		trackEvent( 'chat_jump_to_recent_click' );
	}, [ scrollParent, trackEvent ] );

	if ( isMinimized || chat.messages.length < 2 || chat.status !== 'loaded' ) {
		return null;
	}

	const className = clsx( 'odie-gradient-to-white', {
		'is-visible': needsScrolling,
		'is-hidden': ! needsScrolling,
	} );

	return (
		<div className={ className }>
			<button className="odie-jump-to-recent-message-button" onClick={ jumpToRecent }>
				{ __( 'Jump to recent', __i18n_text_domain__ ) }
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
