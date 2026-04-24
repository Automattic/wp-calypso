import { isEnabled } from '@automattic/calypso-config';
import AchievementsGrid from './achievements-grid';
import AchievementsSettings from './achievements-settings';
import { useAchievementsVisibility } from './use-achievements-visibility';
import type { ReaderUser } from '@automattic/api-core';

import './style.scss';

interface UserAchievementsProps {
	user: ReaderUser;
}

const UserAchievements = ( { user }: UserAchievementsProps ): JSX.Element | null => {
	const { isOwnProfile, isVisible } = useAchievementsVisibility( user.user_login );

	if ( ! isEnabled( 'reader/achievements' ) || ! isVisible ) {
		return null;
	}

	return (
		<div className="achievements">
			<div className="achievements__header">{ isOwnProfile && <AchievementsSettings /> }</div>
			<AchievementsGrid />
		</div>
	);
};

export default UserAchievements;
