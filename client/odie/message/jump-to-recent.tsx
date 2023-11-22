import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { Icon, chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useOdieAssistantContext } from '../context';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * This might be synced with CSS in client/odie/message/style.scss, which is half of the height for the gradient.
 * Used to calculate the bottom offset for the jump to recent button, so it doesn't overlap with the last message.
 * Also, making it twice as big, will prevent the gradient to be not visible when the input grows/shrinks in height.
 */
const heightOffset = 48;

export const JumpToRecent = ( {
	scrollToBottom,
	enableJumpToRecent,
	bottomOffset,
}: {
	scrollToBottom: () => void;
	enableJumpToRecent: boolean;
	bottomOffset: number;
} ) => {
	const { botSetting, botNameSlug } = useOdieAssistantContext();
	const translate = useTranslate();
	const dispatch = useDispatch();
	const jumpToRecent = () => {
		scrollToBottom();
		dispatch(
			recordTracksEvent( 'calypso_odie_chat_jump_to_recent_click', {
				bot_name_slug: botNameSlug,
				bot_setting: botSetting,
			} )
		);
	};

	const { isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
			initialRoute: store.getInitialRoute(),
		};
	}, [] );

	if ( isMinimized && botNameSlug === 'wpcom-support-assistant' ) {
		return null;
	}

	const className = classnames( 'odie-gradient-to-white', {
		'is-visible': enableJumpToRecent,
		'is-hidden': ! enableJumpToRecent,
	} );

	return (
		<div className={ className } style={ { bottom: bottomOffset - heightOffset } }>
			<button className="odie-jump-to-recent-message-button" onClick={ jumpToRecent }>
				{ translate( 'Jump to recent', {
					context:
						'A dynamic button that appears on a chatbox, when the last message is not vissible',
				} ) }
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
