import {
	accountEmailRecoverySnoozeMutation,
	accountEmailRecoverySnoozeQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import Notice, {
	NoticeActionButton,
	NoticeActionLinkButton,
	RouterNoticeActionLinkButton,
} from '../../components/notice';
import {
	getAccountEmailRecoverySnoozeUntil,
	hasVerifiedAccountRecovery,
	isAccountEmailAtRisk,
	isAccountEmailRecoverySnoozed,
} from './account-email-recovery';
import type { VerifiedAccountRecovery } from './account-email-recovery';

interface Props {
	savedEmail: string;
	isDraft: boolean;
	showDraftRecoveryWarning: boolean;
	isPending: boolean;
	hasUnsavedChanges: boolean;
	verifiedRecovery: VerifiedAccountRecovery | undefined;
}

export default function AccountEmailRecoveryNotice( {
	savedEmail,
	isDraft,
	showDraftRecoveryWarning,
	isPending,
	hasUnsavedChanges,
	verifiedRecovery,
}: Props ) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const snoozeQuery = accountEmailRecoverySnoozeQuery( user.ID );
	const { data: snoozeUntil, isFetchedAfterMount } = useQuery( {
		...snoozeQuery,
		enabled: isAccountEmailAtRisk( savedEmail ),
	} );
	const dismiss = useMutation( {
		...accountEmailRecoverySnoozeMutation(),
		onSuccess: async ( until ) => {
			await queryClient.cancelQueries( { queryKey: snoozeQuery.queryKey } );
			queryClient.setQueryData( snoozeQuery.queryKey, until );
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

	let message: string = __(
		'If you don’t have a verified recovery email or phone number, set one up in case you lose access to this email address.'
	);
	if ( isPending ) {
		message = sprintf(
			/* translators: %s: the current sign-in email address */
			__(
				'Until you confirm the change, %s is still your sign-in email. Add or verify a recovery email or phone number in case you lose access to it.'
			),
			savedEmail
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
