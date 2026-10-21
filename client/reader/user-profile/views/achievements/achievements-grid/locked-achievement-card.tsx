import AchievementCard from './achievement-card';
import SecretAchievementCard from './secret-achievement-card';
import type { LockedAchievementEntry } from '@automattic/api-core';

export default function LockedAchievementCard( { entry }: { entry: LockedAchievementEntry } ) {
	if ( entry.is_redacted ) {
		return <SecretAchievementCard locked />;
	}

	return (
		<AchievementCard
			locked
			title={ entry.name }
			isA8cOnly={ entry.is_a8c_only }
			description={ entry.description }
			progressCurrent={ entry.progress }
			progressTarget={ entry.target }
		/>
	);
}
