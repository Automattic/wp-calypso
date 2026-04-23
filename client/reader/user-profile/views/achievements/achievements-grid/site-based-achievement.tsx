import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getOldestTrophy } from '../utils';
import AchievementCard from './achievement-card';
import type { Trophy } from '@automattic/api-core';

export default function SiteBasedAchievement( {
	trophy,
	trophies,
}: {
	trophy: Trophy;
	trophies: Trophy[];
} ) {
	const translate = useTranslate();
	const oldest = getOldestTrophy( trophy.type, trophies );

	return (
		<AchievementCard
			image={ `https:${ trophy.image }` }
			title={ trophy.title }
			badge={
				trophy.level > 0
					? translate( 'Level %(level)d', { args: { level: trophy.level } } )
					: undefined
			}
			caption={
				oldest?.url
					? translate( 'First unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
							args: { site: oldest.message },
							components: {
								timeSince: <TimeSince date={ oldest.date } />,
								a: <a href={ oldest.url } target="_blank" rel="noopener noreferrer" />,
							},
					  } )
					: translate( 'Unlocked {{timeSince/}}', {
							components: {
								timeSince: <TimeSince date={ trophy.date } />,
							},
					  } )
			}
		/>
	);
}
