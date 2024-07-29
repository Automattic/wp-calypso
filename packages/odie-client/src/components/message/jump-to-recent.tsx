import { Icon, chevronDown } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useOdieAssistantContext } from '../../context';

export const JumpToRecent = ( { scrollToRecent }: { scrollToRecent: () => void } ) => {
	const { trackEvent, isMinimized, lastMessageInView } = useOdieAssistantContext();
	const { _x } = useI18n();
	const jumpToRecent = () => {
		scrollToRecent();
		trackEvent( 'chat_jump_to_recent_click' );
	};

	if ( isMinimized ) {
		return null;
	}

	const className = clsx( 'odie-gradient-to-white', {
		'is-visible': ! lastMessageInView,
		'is-hidden': lastMessageInView,
	} );

	return (
		<div className={ className }>
			<button
				className="odie-jump-to-recent-message-button"
				disabled={ lastMessageInView }
				onClick={ jumpToRecent }
			>
				{
					/* translators: A dynamic button that appears on a chatbox, when the last message is not vissible */
					_x(
						'Jump to recent',
						'A dynamic button that appears on a chatbox, when the last message is not vissible',
						__i18n_text_domain__
					)
				}
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
