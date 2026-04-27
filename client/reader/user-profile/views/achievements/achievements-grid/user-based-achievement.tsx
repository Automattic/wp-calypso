import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getOldestAchievement } from '../utils';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function UserBasedAchievement( {
	achievement,
	achievements,
}: {
	achievement: Achievement;
	achievements: Achievement[];
} ) {
	const translate = useTranslate();
	const hasMultiple = achievements.filter( ( a ) => a.slug === achievement.slug ).length > 1;
	const oldest = hasMultiple ? getOldestAchievement( achievement.slug, achievements ) : undefined;
	const unlockDate = oldest?.date ?? achievement.date;

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			badge={
				achievement.level > 0
					? translate( 'Level %(level)d', { args: { level: achievement.level } } )
					: undefined
			}
			description={ achievement.description }
			caption={
				hasMultiple
					? translate( 'First unlocked: {{timeSince/}}', {
							components: { timeSince: <TimeSince date={ unlockDate } /> },
					  } )
					: translate( 'Unlocked: {{timeSince/}}', {
							components: { timeSince: <TimeSince date={ unlockDate } /> },
					  } )
			}
		/>
	);
}
