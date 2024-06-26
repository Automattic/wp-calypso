import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useOdieAssistantContext } from '../../context';

export const JumpToRecent = ( {
	scrollToBottom,
	enableJumpToRecent,
}: {
	scrollToBottom: () => void;
	enableJumpToRecent: boolean;
} ) => {
	const { trackEvent, isMinimized } = useOdieAssistantContext();
	const translate = useTranslate();
	const jumpToRecent = () => {
		scrollToBottom();
		trackEvent( 'chat_jump_to_recent_click' );
	};

	if ( isMinimized ) {
		return null;
	}

	const className = clsx( 'odie-gradient-to-white', {
		'is-visible': enableJumpToRecent,
		'is-hidden': ! enableJumpToRecent,
	} );

	return (
		<div className={ className }>
			<button
				className="odie-jump-to-recent-message-button"
				disabled={ ! enableJumpToRecent }
				onClick={ jumpToRecent }
			>
				{ translate( 'Jump to recent', {
					context:
						'A dynamic button that appears on a chatbox, when the last message is not vissible',
				} ) }
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
