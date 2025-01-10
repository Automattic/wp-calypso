import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import UserProfileHeader from 'calypso/reader/user-stream/components/user-profile-header';

interface UserListsProps {
	user: UserData;
}

const UserLists = ( { user }: UserListsProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="user-stream__lists">
			<UserProfileHeader user={ user } />
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ formatListBullets } size={ 48 } /> }
				title={ null }
				line={ translate( 'No lists yet.' ) }
			/>
		</div>
	);
};

export default UserLists;
