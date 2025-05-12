import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

export default function useGetEmailToVerify() {
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const settingsKey = isEmailChangePending ? 'new_user_email' : 'user_email';
	const email = useSelector( ( state ) => getUserSetting( state, settingsKey ) );
	const isFetchingEmail = useSelector( ( state ) => isFetchingUserSettings( state ) );

	if ( isFetchingEmail || ( isVerified && ! isEmailChangePending ) ) {
		return null;
	}

	return email;
}
