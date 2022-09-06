/**
 * External Dependencies
 */
import './help-center-inline-chat.scss';
import { useDispatch } from '@wordpress/data';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE } from '../stores';

const InlineChat: React.FC = () => {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );

	return (
		<iframe
			ref={ ( ref ) => setIframe( ref ) }
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src="https://widgets.wp.com/calypso-happychat/"
		/>
	);
};

export default InlineChat;
