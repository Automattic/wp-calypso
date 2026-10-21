import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function AnniversaryAchievement( {
	achievement,
	achievements,
}: {
	achievement: Achievement;
	achievements: Achievement[];
} ) {
	const translate = useTranslate();
	const anniversaries = achievements.filter( ( a ) => a.slug === 'user_anniversary' );
	const mostRecent = anniversaries.reduce( ( a, b ) =>
		new Date( a.date_unlocked ) > new Date( b.date_unlocked ) ? a : b
	);

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			isSecret={ achievement.is_secret }
			isRetired={ !! achievement.date_retired }
			isA8cOnly={ achievement.is_a8c_only }
			description={ achievement.description }
			caption={ translate( 'Last unlocked: {{timeSince/}}', {
				components: {
					timeSince: <TimeSince date={ mostRecent.date_unlocked } />,
				},
			} ) }
		/>
	);
}
