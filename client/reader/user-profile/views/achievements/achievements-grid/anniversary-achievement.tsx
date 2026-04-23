import { useTranslate } from 'i18n-calypso';
import { formatDate } from '../utils';
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
	// Trophies arrive newest-first, so the first match is the most recent.
	const mostRecent = anniversaries[ 0 ] ?? trophy;

	return (
		<AchievementCard
			image={ `https:${ trophy.image }` }
			title={ trophy.title }
			badge={ translate( '%(years)d year', '%(years)d years', {
				count: years,
				args: { years },
			} ) }
			description={ trophy.message || undefined }
			caption={ translate( 'Last unlocked on %(date)s', {
				args: { date: formatDate( mostRecent.date ) },
			} ) }
		/>
	);
}
