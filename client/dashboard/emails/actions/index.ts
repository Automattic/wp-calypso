import { useDeleteEmailForwardAction } from './delete-email-forward';
import { useDeleteTitanMailboxAction } from './delete-titan-mailbox';
import { useFinishSetupAction } from './finish-setup';
import { useManageGoogleWorkspaceAction } from './manage-google-workspace';
import { usePaymentDetailsAction } from './payment-details';
import { useResendVerificationAction } from './resend-verification';
import { useViewMailboxAction } from './view-mailbox';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export function useEmailActions(): Action< Email >[] {
	return [
		useViewMailboxAction(),
		useFinishSetupAction(),
		useManageGoogleWorkspaceAction(),
		usePaymentDetailsAction(),
		useResendVerificationAction(),
		useDeleteTitanMailboxAction(),
		useDeleteEmailForwardAction(),
	];
}
