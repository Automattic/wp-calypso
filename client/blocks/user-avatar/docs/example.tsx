import { ComponentProps } from 'react';
import UserAvatar from 'calypso/blocks/user-avatar';

const UserAvatarExample = (): JSX.Element => {
	const user: ComponentProps< typeof UserAvatar >[ 'user' ] = {
		avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		name: 'Matt',
	};

	return (
		<div className="design-assets__group">
			<UserAvatar user={ user } />
		</div>
	);
};

UserAvatarExample.displayName = 'UserAvatar';

export default UserAvatarExample;
