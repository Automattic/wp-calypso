import { siteByIdQuery } from '@automattic/api-queries';
import { TimeSince } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
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
	const siteId = oldest?.site_ID ?? trophy.site_ID;
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: siteId !== 0,
	} );
	// For site-based achievements with the URL defined, the message is the site name, so we don't want to show it twice.
	const description = trophy.url ? undefined : trophy.message;

	return (
		<AchievementCard
			image={ `https:${ trophy.image }` }
			title={ trophy.title }
			badge={
				trophy.level > 0
					? translate( 'Level %(level)d', { args: { level: trophy.level } } )
					: undefined
			}
			description={ description }
			caption={
				site
					? translate( 'First unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
							args: { site: site.name },
							components: {
								timeSince: <TimeSince date={ oldest?.date ?? trophy.date } />,
								a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
							},
					  } )
					: translate( 'Unlocked: {{timeSince/}}', {
							components: {
								timeSince: <TimeSince date={ oldest?.date ?? trophy.date } />,
							},
					  } )
			}
		/>
	);
}
