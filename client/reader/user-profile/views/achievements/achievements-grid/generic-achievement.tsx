import { siteByIdQuery } from '@automattic/api-queries';
import { TimeSince } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { getOldestAchievement } from '../utils';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function GenericAchievement( {
	achievement,
	achievements,
}: {
	achievement: Achievement;
	achievements: Achievement[];
} ) {
	const translate = useTranslate();
	const hasMultiple = achievements.filter( ( a ) => a.slug === achievement.slug ).length > 1;
	const oldest = hasMultiple ? getOldestAchievement( achievement.slug, achievements ) : undefined;
	const unlockDate = oldest?.date_unlocked ?? achievement.date_unlocked;
	const siteId = oldest?.site_ID ?? achievement.site_ID ?? 0;
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: siteId !== 0,
	} );

	const caption = () => {
		if ( site ) {
			return hasMultiple
				? translate( 'First unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
						args: { site: site.name },
						components: {
							timeSince: <TimeSince date={ unlockDate } />,
							a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
						},
				  } )
				: translate( 'Unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
						args: { site: site.name },
						components: {
							timeSince: <TimeSince date={ unlockDate } />,
							a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
						},
				  } );
		}
		return hasMultiple
			? translate( 'First unlocked: {{timeSince/}}', {
					components: { timeSince: <TimeSince date={ unlockDate } /> },
			  } )
			: translate( 'Unlocked: {{timeSince/}}', {
					components: { timeSince: <TimeSince date={ unlockDate } /> },
			  } );
	};

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			badge={
				achievement.level > 0
					? translate( 'Level %(level)d', { args: { level: achievement.level } } )
					: undefined
			}
			isSecret={ achievement.is_secret }
			isRetired={ !! achievement.date_retired }
			isA8cOnly={ achievement.is_a8c_only }
			description={ achievement.description }
			caption={ caption() }
		/>
	);
}
