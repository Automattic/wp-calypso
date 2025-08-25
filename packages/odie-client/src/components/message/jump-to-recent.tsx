import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { useOdieAssistantContext } from '../../context';

const SCROLL_THRESHOLD = 200;

export const JumpToRecent = ( {
	containerReference,
}: {
	containerReference: RefObject< HTMLDivElement >;
} ) => {
	const { trackEvent, isMinimized, chat } = useOdieAssistantContext();
	const scrollParent = containerReference.current?.closest< HTMLDivElement >(
		'.help-center__container-content'
	);
	const [ needsScrolling, setNeedsScrolling ] = useState( false );

	useEffect( () => {
		scrollParent?.addEventListener( 'scroll', ( event: Event ) => {
			const target: HTMLDivElement = event.currentTarget as HTMLDivElement;
			if ( target ) {
				setNeedsScrolling(
					target.scrollTop + target.offsetHeight < target.scrollHeight - SCROLL_THRESHOLD
				);
			}
		} );
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
