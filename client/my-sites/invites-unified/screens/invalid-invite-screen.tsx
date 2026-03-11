import { useTranslate } from 'i18n-calypso';
import { InviteScreenLayout } from './invite-screen-layout';
import type { InviteBlogDetails, InviteError } from '../types';

interface InvalidInviteScreenProps {
	blogDetails?: InviteBlogDetails;
	inviteError: InviteError;
}

export function InvalidInviteScreen( { blogDetails, inviteError }: InvalidInviteScreenProps ) {
	const translate = useTranslate();

	const showUserCard = inviteError.error === 'unauthorized_created_by_self';

	return (
		<InviteScreenLayout
			title={ translate( 'The invite is not valid' ) }
			description={ inviteError.message }
			blogDetails={ blogDetails }
			trackingEventPrefix="calypso_invite_invalid"
			showUserCard={ showUserCard }
		/>
	);
}

export default InvalidInviteScreen;
