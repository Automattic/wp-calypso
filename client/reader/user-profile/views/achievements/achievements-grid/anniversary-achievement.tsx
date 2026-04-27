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
		new Date( a.date ) > new Date( b.date ) ? a : b
	);

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			description={ achievement.description }
			caption={ translate( 'Last unlocked: {{timeSince/}}', {
				components: {
					timeSince: <TimeSince date={ mostRecent.date } />,
				},
			} ) }
		/>
	);
}
