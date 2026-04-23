import { isEnabled } from '@automattic/calypso-config';
import AchievementsGrid from './achievements-grid';

const UserAchievements = (): JSX.Element | null => {
	if ( ! isEnabled( 'reader/achievements' ) ) {
		return null;
	}

	return <AchievementsGrid />;
};

export default UserAchievements;
