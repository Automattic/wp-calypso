import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AchievementCard from './achievement-card';
import type { Trophy } from '@automattic/api-core';

export default function AnniversaryAchievement( {
	trophy,
	trophies,
}: {
	trophy: Trophy;
	trophies: Trophy[];
} ) {
	const translate = useTranslate();
	const anniversaries = trophies.filter( ( t ) => t.type === 'anniversary' );
	const years = anniversaries.length;
	const mostRecent = anniversaries.reduce( ( a, b ) =>
		new Date( a.date ) > new Date( b.date ) ? a : b
	);

	return (
		<AchievementCard
			image={ `https:${ trophy.image }` }
			title={ trophy.title }
			badge={ translate( '%(years)d year', '%(years)d years', {
				count: years,
				args: { years },
			} ) }
			description={ trophy.message || undefined }
			caption={ translate( 'Last unlocked: {{timeSince/}}', {
				components: {
					timeSince: <TimeSince date={ mostRecent.date } />,
				},
			} ) }
		/>
	);
}
