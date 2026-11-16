import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import Notice, {
	NoticeActionButton,
	NoticeActionLinkButton,
	RouterNoticeActionLinkButton,
} from '../../components/notice';
import {
	getAccountEmailRecoverySnoozeUntil,
	hasSameDomainRecoveryEmail,
	hasVerifiedAccountRecovery,
	isAccountEmailAtRisk,
	isAccountEmailRecoverySnoozed,
} from './account-email-recovery';
import type { VerifiedAccountRecovery } from './account-email-recovery';

interface Props {
	savedEmail: string;
	draftEmail?: string;
	showDraftRecoveryWarning: boolean;
	isPending: boolean;
	hasUnsavedChanges: boolean;
	verifiedRecovery: VerifiedAccountRecovery | undefined;
}

export default function AccountEmailRecoveryNotice( {
	savedEmail,
	draftEmail,
	showDraftRecoveryWarning,
	isPending,
	hasUnsavedChanges,
	verifiedRecovery,
}: Props ) {
	const isDraft = draftEmail !== undefined;
	const warningEmail = draftEmail ?? savedEmail;
	const queryClient = useQueryClient();
	const snoozeQuery = userPreferenceQuery( 'account-email-recovery-snoozed-until' );
	const { data: snoozeUntil, isFetchedAfterMount } = useQuery( {
		...snoozeQuery,
		enabled: isAccountEmailAtRisk( savedEmail ),
		refetchOnMount: 'always',
		refetchOnWindowFocus: false,
	} );
	const dismissMutation = userPreferenceMutation( 'account-email-recovery-snoozed-until' );
	const dismiss = useMutation( {
		...dismissMutation,
		onSuccess: async ( preferences, until, context ) => {
			if ( preferences[ 'account-email-recovery-snoozed-until' ] !== until ) {
				throw new Error( 'Recovery reminder preference was not saved.' );
			}
			await queryClient.cancelQueries( { queryKey: snoozeQuery.queryKey } );
			await dismissMutation.onSuccess?.( preferences, until, context );
		},
	} );

	const showSavedRecoveryWarning =
		isAccountEmailAtRisk( savedEmail ) &&
		!! verifiedRecovery &&
		isFetchedAfterMount &&
		! isAccountEmailRecoverySnoozed( snoozeUntil ) &&
		! hasVerifiedAccountRecovery( savedEmail, verifiedRecovery );
	if ( isDraft ? ! showDraftRecoveryWarning : ! showSavedRecoveryWarning ) {
		return null;
	}

	const sameDomainRecovery = hasSameDomainRecoveryEmail( warningEmail, verifiedRecovery );
	let message: string = __(
		'If you don’t have a verified recovery email or phone number, set one up in case you lose access to this email address.'
	);
	if ( isPending && sameDomainRecovery ) {
		message = sprintf(
			/* translators: %s: the current sign-in email address */
			__(
				'Until you confirm the change, %s is still your sign-in email. Your recovery email uses the same domain, so you could lose access to both at the same time. Add a recovery email on a different domain or verify a phone number.'
			),
			savedEmail
		);
	} else if ( isPending ) {
		message = sprintf(
			/* translators: %s: the current sign-in email address */
			__(
				'Until you confirm the change, %s is still your sign-in email. Add or verify a recovery email or phone number in case you lose access to it.'
			),
			savedEmail
		);
	} else if ( sameDomainRecovery ) {
		message = __(
			'Your recovery email uses the same domain as this email address. You could lose access to both at the same time. Add a recovery email on a different domain or verify a phone number.'
		);
	} else if ( verifiedRecovery ) {
		message = __(
			'If this email address stops working, you could be locked out of your account. Add or verify a recovery email or phone number.'
		);
	}

	const canDismiss = ! isDraft && ! isPending && ! isSupportSession();

	return (
		<Notice
			variant="warning"
			title={ __( 'Protect access to your account' ) }
			actions={
				<>
					{ hasUnsavedChanges || isDraft ? (
						<NoticeActionLinkButton
							variant="outline"
							href="/me/security/account-recovery"
							target="_blank"
							rel="noopener"
							aria-label={ __( 'Set up account recovery (opens in a new tab)' ) }
						>
							{ __( 'Set up account recovery' ) }
						</NoticeActionLinkButton>
					) : (
						<RouterNoticeActionLinkButton variant="outline" to="/me/security/account-recovery">
							{ __( 'Set up account recovery' ) }
						</RouterNoticeActionLinkButton>
					) }
					{ canDismiss && (
						<NoticeActionButton
							type="button"
							variant="outline"
							disabled={ dismiss.isPending }
							onClick={ () => dismiss.mutate( getAccountEmailRecoverySnoozeUntil() ) }
						>
							{ dismiss.isPending ? __( 'Saving…' ) : __( 'Remind me in six months' ) }
						</NoticeActionButton>
					) }
				</>
			}
		>
			{ message }
			{ canDismiss && dismiss.isError && (
				<p role="alert">{ __( 'Could not dismiss this reminder. Please try again.' ) }</p>
			) }
		</Notice>
	);
}
