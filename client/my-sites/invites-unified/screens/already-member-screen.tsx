import { useTranslate } from 'i18n-calypso';
import { InviteScreenLayout } from './invite-screen-layout';
import type { InviteBlogDetails } from '../types';

interface AlreadyMemberScreenProps {
	blogDetails?: InviteBlogDetails;
}

export function AlreadyMemberScreen( { blogDetails }: AlreadyMemberScreenProps ) {
	const translate = useTranslate();

	return (
		<InviteScreenLayout
			title={ translate( 'You are already a member of this site' ) }
			description={ translate( 'Would you like to accept the invite with a different account?' ) }
			blogDetails={ blogDetails }
			trackingEventPrefix="calypso_invite_already_member"
		/>
	);
}

export default AlreadyMemberScreen;
