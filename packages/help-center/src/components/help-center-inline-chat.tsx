/**
 * External Dependencies
 */
import './help-center-inline-chat.scss';

const InlineChat: React.FC = () => {
	return (
		<iframe
			className="help-center-inline-chat__iframe"
			title="Happychat"
			src="https://widgets.wp.com/calypso-happychat/"
		/>
	);
};

export default InlineChat;
