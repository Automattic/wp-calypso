/**
 * External Dependencies
 */
import './help-center-inline-chat.scss';
import { useDispatch } from '@wordpress/data';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE } from '../stores';

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const InlineChat: React.FC = () => {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );

	return (
		<iframe
			ref={ ( ref ) => setIframe( ref ) }
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src={ `https://widgets.wp.com/calypso-happychat/?env=${ env }` }
		/>
	);
};

export default InlineChat;
