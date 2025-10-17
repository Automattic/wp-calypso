import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import './style.scss';

export const ClosedConversationFooter = () => {
	const { __ } = useI18n();
	const { trackEvent } = useOdieAssistantContext();
	const navigate = useNavigate();

	const handleOnClick = async () => {
		trackEvent( 'chat_new_from_closed_conversation' );
		navigate( '/odie' );
	};

	return (
		<div className="odie-closed-conversation-footer">
			<Button
				__next40pxDefaultSize
				variant="secondary"
				onClick={ handleOnClick }
				className="odie-closed-conversation-footer__button"
			>
				{ __( 'Still need help? Start a new chat', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
};
