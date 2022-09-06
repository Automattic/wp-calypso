/**
 * External Dependencies
 */
import './help-center-inline-chat.scss';

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const InlineChat: React.FC = () => {
	return (
		<iframe
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src={ `https://widgets.wp.com/calypso-happychat/?env=${ env }` }
		/>
	);
};

export default InlineChat;
