/**
 * External Dependencies
 */
import { useDispatch } from '@wordpress/data';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE } from '../stores';

const InlineChat: React.FC = () => {
	const { setShowMessagingLauncher } = useDispatch( HELP_CENTER_STORE );
	const { setShowMessagingWidget } = useDispatch( HELP_CENTER_STORE );
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	setShowMessagingLauncher( true );
	setShowMessagingWidget( true );
	setShowHelpCenter( false );

	return null;
};

export default InlineChat;
