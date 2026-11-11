import { useDeleteEmailForwardAction } from './delete-email-forward';
import { useDeleteTitanMailboxAction } from './delete-titan-mailbox';
import { useEditEmailForwardAction } from './edit-email-forward';
import { useFinishSetupAction } from './finish-setup';
import { useManageGoogleWorkspaceAction } from './manage-google-workspace';
import { useManageTitanMailboxesAction } from './manage-titan-mailboxes';
import { usePaymentDetailsAction } from './payment-details';
import { useResendVerificationAction } from './resend-verification';
import { useUpgradeMailboxAction } from './upgrade-mailbox';
import { useViewMailboxAction } from './view-mailbox';
import { useViewTitanDnsRecordsAction } from './view-titan-dns-records';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

export function useActions(): Action< Email >[] {
	return [
		useViewMailboxAction(),
		useFinishSetupAction(),
		useManageGoogleWorkspaceAction(),
		useManageTitanMailboxesAction(),
		useViewTitanDnsRecordsAction(),
		useUpgradeMailboxAction(),
		usePaymentDetailsAction(),
		useResendVerificationAction(),
		useEditEmailForwardAction(),
		useDeleteTitanMailboxAction(),
		useDeleteEmailForwardAction(),
	];
}
