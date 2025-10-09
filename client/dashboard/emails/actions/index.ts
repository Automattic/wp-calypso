import { useDeleteEmailForwardAction } from './delete-email-forward';
import { useDeleteTitanMailboxAction } from './delete-titan-mailbox';
import { finishSetupAction } from './finish-setup';
import { manageGoogleWorkspaceAction } from './manage-google-workspace';
import { usePaymentDetailsAction } from './payment-details';
import { useResendVerificationAction } from './resend-verification';
import { viewMailboxAction } from './view-mailbox';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export function useEmailActions(): Action< Email >[] {
	return [
		viewMailboxAction,
		finishSetupAction,
		manageGoogleWorkspaceAction,
		usePaymentDetailsAction(),
		useResendVerificationAction(),
		useDeleteTitanMailboxAction(),
		useDeleteEmailForwardAction(),
	];
}
