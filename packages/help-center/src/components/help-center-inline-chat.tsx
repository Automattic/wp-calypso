/**
 * External Dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import wpcomRequest from 'wpcom-proxy-request';
import './help-center-inline-chat.scss';
import { HELP_CENTER_STORE } from '../stores';

const InlineChat: React.FC = () => {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );
	const [ env, setEnv ] = useState( '' );

	useEffect( () => {
		const getEnv = async () => {
			const isProxied = await wpcomRequest( { path: '/am-i/proxied', apiNamespace: 'wpcom/v2' } );
			setEnv( isProxied ? 'dev' : 'prod' );
		};
		getEnv();
	}, [] );

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
