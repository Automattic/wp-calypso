import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';
import { useSendApprovalDecision } from '../../data/use-send-approval-decision';
import type { Message } from '../../types';

import './get-support.scss';

/**
 * Approve / decline buttons for a pending write-approval message
 * (context.flags.wpcom_approval_required). The decision endpoints append the outcome to
 * the chat server-side; the hook's query invalidation refetches it, and because this
 * card only renders under the last bot message it disappears once the outcome message
 * arrives.
 */
export const ApprovalRequest = ( { message }: { message: Message } ) => {
	const { trackEvent } = useOdieAssistantContext();
	const approvalDecision = useSendApprovalDecision();

	const token = message.context?.approval?.token;
	if ( ! token ) {
		return null;
	}

	const decide = ( decision: 'approve' | 'decline' ) => {
		trackEvent( 'chat_write_approval_decision', { decision } );
		approvalDecision.mutate( { token, decision } );
	};

	// Once a decision succeeds the refetch replaces this card; keep the buttons locked
	// meanwhile. On error (e.g. an expired token) they re-enable.
	const isLocked = approvalDecision.isPending || approvalDecision.isSuccess;

	return (
		<div className="odie__transfer-chat">
			<button disabled={ isLocked } onClick={ () => decide( 'approve' ) }>
				{ __( 'Approve and continue', __i18n_text_domain__ ) }
			</button>
			<button disabled={ isLocked } onClick={ () => decide( 'decline' ) }>
				{ __( 'Decline', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
