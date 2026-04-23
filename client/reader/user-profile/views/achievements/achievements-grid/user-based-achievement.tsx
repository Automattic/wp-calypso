import { useTranslate } from 'i18n-calypso';
import { formatDate } from '../utils';
import AchievementCard from './achievement-card';
import type { Trophy } from '@automattic/api-core';

export default function UserBasedAchievement( { trophy }: { trophy: Trophy } ) {
	const translate = useTranslate();

	return (
		<AchievementCard
			image={ `https:${ trophy.image }` }
			title={ trophy.title }
			badge={
				trophy.level > 0
					? translate( 'Level %(level)d', { args: { level: trophy.level } } )
					: undefined
			}
			description={ trophy.message || undefined }
			caption={ translate( 'Unlocked on %(date)s', {
				args: { date: formatDate( trophy.date ) },
			} ) }
		/>
	);
}
