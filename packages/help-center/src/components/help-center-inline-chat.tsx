/**
 * External Dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useLocation } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import './help-center-inline-chat.scss';
import { HELP_CENTER_STORE } from '../stores';

const InlineChat: React.FC = () => {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const session = params.get( 'session' ) === 'continued' ? 'continued' : 'new';

	return (
		<iframe
			ref={ ( ref ) => setIframe( ref ) }
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src={ `https://widgets.wp.com/calypso-happychat/?session=${ session }` }
			scrolling="no"
		/>
	);
};

export default InlineChat;
