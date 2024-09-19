import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';

export const DirectEscalationLink = ( { messageId }: { messageId: number | undefined } ) => {
	const { navigateToContactOptions, trackEvent, isUserEligible } = useOdieAssistantContext();

	if ( ! isUserEligible ) {
		return (
			<div className="disclaimer">
				{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
				<button
					onClick={ () => {
						trackEvent( 'chat_message_direct_escalation_link_click', {
							message_id: messageId,
							is_user_eligible: false,
						} );
						if ( navigateToContactOptions ) {
							navigateToContactOptions();
						}
					} }
					className="odie-button-link"
				>
					{ __( 'Ask in our forums.', __i18n_text_domain__ ) }
				</button>
			</div>
		);
	}

	return (
		<div className="disclaimer">
			{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
			<button
				onClick={ () => {
					trackEvent( 'chat_message_direct_escalation_link_click', {
						message_id: messageId,
						is_user_eligible: true,
					} );
					if ( navigateToContactOptions ) {
						navigateToContactOptions();
					}
				} }
				className="odie-button-link"
			>
				{ __( 'Contact our support team.', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
