/**
 * External Dependencies
 */
import { useIsProxied } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
/**
 * Internal Dependencies
 */
import './help-center-inline-chat.scss';
import { HELP_CENTER_STORE } from '../stores';

const InlineChat: React.FC = () => {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );
	const { data: isProxied, isLoading } = useIsProxied();
	const env = isLoading || isProxied?.is_proxied ? 'dev' : 'prod';

	return (
		<iframe
			ref={ ( ref ) => setIframe( ref ) }
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src={ `https://widgets.wp.com/calypso-happychat/?env=${ env }` }
			scrolling="no"
		/>
	);
};

export default InlineChat;
