import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useDispatch } from 'calypso/state';
import { resendInvite, deleteInvite } from 'calypso/state/invites/actions';
import {
	isRequestingInviteResend,
	didInviteResendSucceed,
	didInviteDeletionSucceed,
	isDeletingInvite,
} from 'calypso/state/invites/selectors';

const InviteStatus = ( { type, invite, site } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { ID: siteId } = site;
	const { isPending, key: inviteKey } = invite;

	const inviteWasDeleted = useSelector(
		( state ) => siteId && inviteKey && didInviteDeletionSucceed( state, siteId, inviteKey )
	);

	const requestingResend = useSelector(
		( state ) => siteId && inviteKey && isRequestingInviteResend( state, siteId, inviteKey )
	);

	const resendSuccess = useSelector(
		( state ) => siteId && inviteKey && didInviteResendSucceed( state, siteId, inviteKey )
	);

	const deletingInvite = useSelector(
		( state ) => siteId && inviteKey && isDeletingInvite( state, siteId, inviteKey )
	);

	if ( invite && inviteWasDeleted ) {
		return null;
	}

	const onResend = ( event ) => {
		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( requestingResend || resendSuccess ) {
			return null;
		}

		siteId && inviteKey && dispatch( resendInvite( siteId, inviteKey ) );
	};

	const handleDelete = () => {
		if ( deletingInvite ) {
			return;
		}
		siteId && inviteKey && dispatch( deleteInvite( siteId, inviteKey ) );
	};

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
