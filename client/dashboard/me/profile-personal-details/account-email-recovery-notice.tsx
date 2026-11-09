import {
	accountEmailRecoverySnoozeMutation,
	accountEmailRecoverySnoozeQuery,
	accountRecoveryQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import {
	getAccountEmailRecoverySnoozeUntil,
	hasVerifiedAccountRecovery,
	isAccountEmailAtRisk,
	isAccountEmailRecoverySnoozed,
} from '@automattic/onboarding/src/utils/account-email-recovery';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import Notice, {
	NoticeActionButton,
	NoticeActionLinkButton,
	RouterNoticeActionLinkButton,
} from '../../components/notice';

interface Props {
	savedEmail: string;
	draftEmail?: string;
	isPending: boolean;
	hasUnsavedChanges: boolean;
	hasSaveError: boolean;
}

export default function AccountEmailRecoveryNotice( {
	savedEmail,
	draftEmail,
	isPending,
	hasUnsavedChanges,
	hasSaveError,
}: Props ) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { data: recovery } = useQuery( accountRecoveryQuery() );
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

	const isDraft = draftEmail !== undefined;
	const email = draftEmail ?? savedEmail;
	const verifiedRecovery = recovery && {
		verifiedEmail: recovery.email_validated === true ? recovery.email : undefined,
		hasVerifiedPhone: !! recovery.phone?.number && recovery.phone_validated === true,
	};

	if (
		! isAccountEmailAtRisk( email ) ||
		hasVerifiedAccountRecovery( email, verifiedRecovery ) ||
		( isDraft && hasSaveError ) ||
		( ! isDraft &&
			( ! recovery || ! isFetchedAfterMount || isAccountEmailRecoverySnoozed( snoozeUntil ) ) )
	) {
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
	} else if ( recovery ) {
		message = __(
			'If you lose access to this email address, it may be harder to get back into your account. Add or verify a recovery email or phone number.'
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
