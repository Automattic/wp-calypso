import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

const InviteStatus = ( {
	type,
	invite,
	onResend,
	handleDelete,
	resendSuccess,
	requestingResend,
	deletingInvite,
} ) => {
	const translate = useTranslate();
	const { isPending } = invite;

	return (
		<div
			className={ clsx( 'people-list-item__invite-status', {
				'is-pending': isPending,
				'is-invite-details': type === 'invite-details',
			} ) }
		>
			{ isPending && (
				<Button
					className={ clsx( 'people-list-item__invite-resend', {
						'is-success': resendSuccess,
					} ) }
					onClick={ onResend }
					busy={ requestingResend }
					disabled={ deletingInvite }
				>
					{ resendSuccess ? translate( 'Invite Sent!' ) : translate( 'Resend Invite' ) }
				</Button>
			) }
			<Button
				className="people-list-item__invite-revoke"
				disabled={ requestingResend }
				busy={ deletingInvite }
				onClick={ handleDelete }
			>
				{ isPending ? translate( 'Revoke' ) : translate( 'Clear' ) }
			</Button>
		</div>
	);
};

export default InviteStatus;
