import { useTranslate } from 'i18n-calypso';
import { formatDate, getTrophyFirstSite } from '../utils';
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
	const firstSite = getTrophyFirstSite( trophy.type, trophies );

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
				firstSite
					? translate( 'First unlocked on {{a}}%(site)s{{/a}} on %(date)s', {
							args: { site: firstSite.name, date: formatDate( trophy.date ) },
							components: {
								a: <a href={ firstSite.url } target="_blank" rel="noopener noreferrer" />,
							},
					  } )
					: translate( 'Unlocked on %(date)s', {
							args: { date: formatDate( trophy.date ) },
					  } )
			}
		/>
	);
}
