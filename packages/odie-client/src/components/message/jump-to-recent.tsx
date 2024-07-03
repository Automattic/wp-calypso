import { Icon, chevronDown } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useOdieAssistantContext } from '../../context';

export const JumpToRecent = ( {
	scrollToBottom,
	enableJumpToRecent,
}: {
	scrollToBottom: () => void;
	enableJumpToRecent: boolean;
} ) => {
	const { trackEvent, isMinimized } = useOdieAssistantContext();
	const { __ } = useI18n();
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
				{
					/* translators: A dynamic button that appears on a chatbox, when the last message is not vissible */
					__( 'Jump to recent', __i18n_text_domain__ )
				}
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
