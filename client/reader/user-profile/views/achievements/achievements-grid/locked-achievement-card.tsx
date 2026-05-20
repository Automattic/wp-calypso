import { isLockedSecret } from '../utils';
import AchievementCard from './achievement-card';
import SecretAchievementCard from './secret-achievement-card';
import type { LockedAchievementEntry } from '@automattic/api-core';

export default function LockedAchievementCard( { entry }: { entry: LockedAchievementEntry } ) {
	if ( isLockedSecret( entry ) ) {
		return <SecretAchievementCard locked />;
	}

	return (
		<AchievementCard
			locked
			title={ entry.name }
			description={ entry.description }
			progressCurrent={ entry.progress }
			progressTarget={ entry.target }
		/>
	);
}
