import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';
import { useSendApprovalDecision } from '../../data/use-send-approval-decision';
import type { Message } from '../../types';

import './get-support.scss';

/**
 * Approve / decline buttons for a pending action-approval message
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

	// Once a decision succeeds the continuation replaces this card; keep the buttons locked
	// meanwhile and say which decision is in flight. On error (e.g. an expired token) they re-enable.
	const isLocked = approvalDecision.isPending || approvalDecision.isSuccess;
	const pendingDecision = isLocked ? approvalDecision.variables?.decision : undefined;

	return (
		<div className="odie__transfer-chat">
			<button disabled={ isLocked } onClick={ () => decide( 'approve' ) }>
				{ 'approve' === pendingDecision
					? __( 'Approving…', __i18n_text_domain__ )
					: __( 'Approve and continue', __i18n_text_domain__ ) }
			</button>
			<button disabled={ isLocked } onClick={ () => decide( 'decline' ) }>
				{ 'decline' === pendingDecision
					? __( 'Declining…', __i18n_text_domain__ )
					: __( 'Decline', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
