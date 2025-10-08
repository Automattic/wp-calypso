import {
	deleteEmailForwardMutation,
	deleteTitanMailboxMutation,
	resendVerifyEmailForwardMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { buildDeleteEmailForwardAction } from './delete-email-forward';
import { buildDeleteTitanMailboxAction } from './delete-titan-mailbox';
import { finishSetupAction } from './finish-setup';
import { manageGoogleWorkspaceAction } from './manage-google-workspace';
import { buildPaymentDetailsAction } from './payment-details';
import { buildResendVerificationAction } from './resend-verification';
import { viewMailboxAction } from './view-mailbox';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export function useEmailActions(): Action< Email >[] {
	const navigate = useNavigate();
	const { mutateAsync: resendEmailForwardVerification } = useMutation(
		resendVerifyEmailForwardMutation()
	);
	const { mutateAsync: deleteEmailForward } = useMutation( deleteEmailForwardMutation() );
	const { mutateAsync: deleteTitanMailbox } = useMutation( deleteTitanMailboxMutation() );

	return [
		viewMailboxAction,
		finishSetupAction,
		manageGoogleWorkspaceAction,
		buildPaymentDetailsAction( navigate ),
		buildResendVerificationAction( resendEmailForwardVerification ),
		buildDeleteTitanMailboxAction( deleteTitanMailbox ),
		buildDeleteEmailForwardAction( deleteEmailForward ),
	];
}
