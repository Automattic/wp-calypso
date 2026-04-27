import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function UserBasedAchievement( { achievement }: { achievement: Achievement } ) {
	const translate = useTranslate();

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
			caption={ translate( 'Unlocked: {{timeSince/}}', {
				components: {
					timeSince: <TimeSince date={ achievement.date } />,
				},
			} ) }
		/>
	);
}
