import { CompactCard } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';
import type { Member } from '@automattic/data-stores';

import './style.scss';

const UserListItem = ( { user }: { user: Member } ) => {
	if ( ! user ) {
		return null;
	}

	return (
		<CompactCard className="imported-user-item">
			<input type="checkbox" className="imported-user-item__checkbox" />
			<Gravatar className="imported-user-item__avatar" user={ user } size={ 72 } />
			<div className="imported-user-item__email">{ user.email }</div>
			<div className="imported-user-item__linked">
				{ user.linked_user_ID ? <div>Connected</div> : <div>Not connected</div> }
			</div>
		</CompactCard>
	);
};

export default UserListItem;
