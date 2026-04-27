import { siteByIdQuery } from '@automattic/api-queries';
import { TimeSince } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { getOldestAchievement } from '../utils';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function SiteBasedAchievement( {
	achievement,
	achievements,
}: {
	achievement: Achievement;
	achievements: Achievement[];
} ) {
	const translate = useTranslate();
	const oldest = getOldestAchievement( achievement.slug, achievements );
	const siteId = oldest?.site_ID ?? achievement.site_ID;
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: siteId !== 0,
	} );
	// For site-based achievements with the URL defined, the description is the site name, so we don't want to show it twice.
	const description = achievement.url ? undefined : achievement.description;

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			badge={
				achievement.level > 0
					? translate( 'Level %(level)d', { args: { level: achievement.level } } )
					: undefined
			}
			description={ description }
			caption={
				site
					? translate( 'First unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
							args: { site: site.name },
							components: {
								timeSince: <TimeSince date={ oldest?.date ?? achievement.date } />,
								a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
							},
					  } )
					: translate( 'Unlocked: {{timeSince/}}', {
							components: {
								timeSince: <TimeSince date={ oldest?.date ?? achievement.date } />,
							},
					  } )
			}
		/>
	);
}
