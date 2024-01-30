import { CompactCard } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';

const UserListItem = ( { user } ) => {
	return (
		<CompactCard>
			<Gravatar user={ user } size={ 72 } />
			<div>{ user.email }</div>
		</CompactCard>
	);
};

export default UserListItem;
