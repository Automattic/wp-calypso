import { ApprovalCard } from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ApprovalCardProps } from '@automattic/agenttic-ui';

export interface ActionApprovalProps extends ApprovalCardProps {
	onRetryResume?: () => void;
	isResuming?: boolean;
}

export function ActionApproval( props: Partial< ActionApprovalProps > ) {
	const { proposalId, description, notice, allowForChat, state, onDecision } = props;
	if (
		! proposalId ||
		description === undefined ||
		notice === undefined ||
		allowForChat === undefined ||
		! state ||
		! onDecision
	) {
		return null;
	}
	return (
		<>
			<ApprovalCard
				{ ...props }
				proposalId={ proposalId }
				description={ description }
				notice={ notice }
				allowForChat={ allowForChat }
				state={ state }
				onDecision={ onDecision }
			/>
			{ props.onRetryResume && (
				<Button variant="secondary" disabled={ props.isResuming } onClick={ props.onRetryResume }>
					{ __( 'Retry continuation', __i18n_text_domain__ ) }
				</Button>
			) }
		</>
	);
}
