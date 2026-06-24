import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import './style.scss';

export const ClosedConversationFooter = ( {
	currentInteractionId,
	targetInteractionId,
}: {
	currentInteractionId?: string | null;
	targetInteractionId?: string | null;
} ) => {
	const { __ } = useI18n();
	const { trackEvent } = useOdieAssistantContext();
	const navigate = useNavigate();
	const { search } = useLocation();

	const handleGoToOpenChat = () => {
		if ( ! targetInteractionId ) {
			return;
		}
		trackEvent( 'chat_go_to_open_from_merged_conversation', {
			from_interaction_id: currentInteractionId ?? null,
			to_interaction_id: targetInteractionId,
		} );
		const params = new URLSearchParams( search );
		params.set( 'id', targetInteractionId );
		navigate( '/odie?' + params.toString() );
	};

	const handleStartNewChat = () => {
		trackEvent( 'chat_new_from_closed_conversation' );
		navigate( '/odie' );
	};

	return (
		<div className="odie-closed-conversation-footer">
			{ targetInteractionId ? (
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ handleGoToOpenChat }
					className="odie-closed-conversation-footer__button"
				>
					{ __( 'Continue in your open chat', __i18n_text_domain__ ) }
				</Button>
			) : (
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ handleStartNewChat }
					className="odie-closed-conversation-footer__button"
				>
					{ __( 'Still need help? Start a new chat', __i18n_text_domain__ ) }
				</Button>
			) }
		</div>
	);
};
