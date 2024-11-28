import { useI18n } from '@wordpress/react-i18n';
import './style.scss';

const ChatWithSupportLabel = () => {
	const { __ } = useI18n();
	return (
		<div className="chat-with-support-wrapper">
			<div className="chat-with-support__line"></div>
			<div className="chat-with-support__message">
				{ __( 'Chatting with support now', __i18n_text_domain__ ) }
			</div>
			<div className="chat-with-support__line"></div>
		</div>
	);
};

export default ChatWithSupportLabel;
