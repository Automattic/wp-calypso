import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

const InviteStatus = ( {
	type,
	invite,
	onResend,
	handleDelete,
	resendSuccess,
	requestingResend,
	inviteWasDeleted,
	deletingInvite,
} ) => {
	const translate = useTranslate();
	const { isPending } = invite;

	if ( invite && inviteWasDeleted ) {
		return null;
	}

	return (
		<div
			className={ classNames( 'people-list-item__invite-status', {
				'is-pending': isPending,
				'is-invite-details': type === 'invite-details',
			} ) }
		>
			{ isPending && (
				<Button
					className={ classNames( 'people-list-item__invite-resend', {
						'is-success': resendSuccess,
					} ) }
					onClick={ onResend }
					busy={ requestingResend }
				>
					{ resendSuccess ? translate( 'Invite Sent!' ) : translate( 'Resend Invite' ) }
				</Button>
			) }
			<Button
				className="people-list-item__invite-revoke"
				busy={ deletingInvite }
				onClick={ handleDelete }
			>
				{ isPending ? translate( 'Revoke' ) : translate( 'Clear' ) }
			</Button>
		</div>
	);
};

export default InviteStatus;
