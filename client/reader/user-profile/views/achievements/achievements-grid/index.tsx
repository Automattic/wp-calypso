import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import { deduplicateAchievements } from '../utils';
import AnniversaryAchievement from './anniversary-achievement';
import SiteBasedAchievement from './site-based-achievement';
import UserBasedAchievement from './user-based-achievement';

import './style.scss';

export default function AchievementsGrid( { userLogin }: { userLogin: string } ) {
	const translate = useTranslate();
	const { achievements, isLoading } = useAchievementsQuery( userLogin );

	if ( isLoading ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading achievements…' ) }
			</div>
		);
	}

	if ( ! achievements.length ) {
		return <p className="achievements-grid__empty">{ translate( 'No achievements yet.' ) }</p>;
	}

	const deduplicated = deduplicateAchievements( achievements );

	return (
		<div className="achievements-grid">
			{ deduplicated.map( ( achievement ) => {
				if ( achievement.slug === 'user_anniversary' ) {
					return (
						<AnniversaryAchievement
							key={ achievement.achievement_id }
							achievement={ achievement }
							achievements={ achievements }
						/>
					);
				}

				if ( achievement.site_ID !== 0 ) {
					return (
						<SiteBasedAchievement
							key={ achievement.achievement_id }
							achievement={ achievement }
							achievements={ achievements }
						/>
					);
				}

				return (
					<UserBasedAchievement key={ achievement.achievement_id } achievement={ achievement } />
				);
			} ) }
		</div>
	);
}
