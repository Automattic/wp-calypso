import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';
import { useSendApprovalDecision } from '../../data/use-send-approval-decision';
import type { Message } from '../../types';

import './get-support.scss';

const DECIDED_LABELS: Record< string, string > = {
	executed: __( 'You approved this action and it was completed.', __i18n_text_domain__ ),
	declined: __( 'You declined this action. It was not performed.', __i18n_text_domain__ ),
	failed: __( 'You approved this action, but it could not be completed.', __i18n_text_domain__ ),
};

/**
 * The card under an action-approval message (context.flags.wpcom_approval_required).
 *
 * Once a decision is recorded the server marks the message's `approval.status` and drops the
 * token, so a decided card shows a label on every later load. A pending card offers the
 * buttons only while it is the live end of the conversation; a pending card that is no longer
 * last was superseded (the user typed instead) and shows nothing.
 */
export const ApprovalRequest = ( { message, isLive }: { message: Message; isLive: boolean } ) => {
	const { trackEvent, chat } = useOdieAssistantContext();
	const chatStatus = chat.status;
	const approvalDecision = useSendApprovalDecision();

	const status = message.context?.approval?.status;
	if ( status && status in DECIDED_LABELS ) {
		return (
			<div className="odie__transfer-chat">
				<p className="odie__transfer-chat--note">{ DECIDED_LABELS[ status ] }</p>
			</div>
		);
	}

	const token = message.context?.approval?.token;
	if ( ! token || ! isLive ) {
		return null;
	}

	// The server stops accepting a decision after expires_at. Past it, the card would only invite a
	// click that fails, so say so instead of offering buttons.
	const expiresAt = message.context?.approval?.expires_at;
	const isExpired = typeof expiresAt === 'number' && Date.now() / 1000 >= expiresAt;
	if ( isExpired ) {
		return (
			<div className="odie__transfer-chat">
				<p className="odie__transfer-chat--note">
					{ __(
						'This request has expired and was not performed. Ask again if you still want it.',
						__i18n_text_domain__
					) }
				</p>
			</div>
		);
	}

	const decide = ( decision: 'approve' | 'decline' ) => {
		trackEvent( 'chat_write_approval_decision', { decision } );
		approvalDecision.mutate( { token, decision } );
	};

	// Once a decision succeeds the continuation replaces this card; keep the buttons locked
	// meanwhile and say which decision is in flight. On a request error the hook reloads the chat
	// from the server, which replaces this card with its recorded state (decided label, outcome
	// or continuation message). The buttons stay locked while that happens; they come back only
	// if the reload still shows this card pending — i.e. the request genuinely never reached the
	// server — with a note that says so. A failure of the approved action is not an error here —
	// the server reports it as the decision's outcome and the bot explains it in the continuation.
	const isReloading = approvalDecision.isError && chatStatus === 'loading';
	const isLocked = approvalDecision.isPending || approvalDecision.isSuccess || isReloading;
	const pendingDecision = isLocked ? approvalDecision.variables?.decision : undefined;
	const errorMessage =
		approvalDecision.isError && ! isReloading
			? __( 'That didn’t go through. Check your connection and try again.', __i18n_text_domain__ )
			: null;

	const labelFor = ( decision: 'approve' | 'decline' ) => {
		if ( decision !== pendingDecision ) {
			return 'approve' === decision
				? __( 'Approve and continue', __i18n_text_domain__ )
				: __( 'Decline', __i18n_text_domain__ );
		}
		if ( isReloading ) {
			return __( 'Checking…', __i18n_text_domain__ );
		}
		return 'approve' === decision
			? __( 'Approving…', __i18n_text_domain__ )
			: __( 'Declining…', __i18n_text_domain__ );
	};

	return (
		<div className="odie__transfer-chat">
			<button disabled={ isLocked } onClick={ () => decide( 'approve' ) }>
				{ labelFor( 'approve' ) }
			</button>
			<button disabled={ isLocked } onClick={ () => decide( 'decline' ) }>
				{ labelFor( 'decline' ) }
			</button>
			{ errorMessage && <p className="odie__transfer-chat--error">{ errorMessage }</p> }
		</div>
	);
};
