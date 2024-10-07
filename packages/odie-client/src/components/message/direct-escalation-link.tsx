import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';

export const DirectEscalationLink = ( { messageId }: { messageId: number | undefined } ) => {
	const { trackEvent, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const navigate = useNavigate();
	const handleClick = useCallback( () => {
		trackEvent( 'chat_message_direct_escalation_link_click', {
			message_id: messageId,
			is_user_eligible_for_paid_support: isUserEligibleForPaidSupport,
		} );

		if ( isUserEligibleForPaidSupport ) {
			navigate( '/contact-options' );
		} else {
			navigate( '/contact-form?mode=FORUM' );
		}
	}, [ navigate, isUserEligibleForPaidSupport, trackEvent, messageId ] );

	return (
		<div className="disclaimer">
			{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
			<button onClick={ handleClick } className="odie-button-link">
				{ isUserEligibleForPaidSupport
					? __( 'Contact our support team.', __i18n_text_domain__ )
					: __( 'Ask in our forums.', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
