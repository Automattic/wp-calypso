import { isEnabled } from '@automattic/calypso-config';
import AchievementsGrid from './achievements-grid';
import AchievementsSettings from './achievements-settings';

import './style.scss';

const UserAchievements = (): JSX.Element | null => {
	if ( ! isEnabled( 'reader/achievements' ) ) {
		return null;
	}

	return (
		<div className="achievements">
			<div className="achievements__header">
				<AchievementsSettings />
			</div>
			<AchievementsGrid />
		</div>
	);
};

export default UserAchievements;
