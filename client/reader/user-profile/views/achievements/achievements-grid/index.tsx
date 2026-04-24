import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useTrophiesQuery } from 'calypso/data/reader/use-trophies-query';
import { deduplicateTrophies } from '../utils';
import AnniversaryAchievement from './anniversary-achievement';
import SiteBasedAchievement from './site-based-achievement';
import UserBasedAchievement from './user-based-achievement';

import './style.scss';

export default function AchievementsGrid() {
	const translate = useTranslate();
	const { trophies, isLoading } = useTrophiesQuery();

	if ( isLoading ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading achievements…' ) }
			</div>
		);
	}

	if ( ! trophies.length ) {
		return <p className="achievements-grid__empty">{ translate( 'No achievements yet.' ) }</p>;
	}

	const deduplicated = deduplicateTrophies( trophies );

	return (
		<div className="achievements-grid">
			{ deduplicated.map( ( trophy ) => {
				if ( trophy.type === 'anniversary' ) {
					return (
						<AnniversaryAchievement
							key={ trophy.achievement_id }
							trophy={ trophy }
							trophies={ trophies }
						/>
					);
				}

				if ( trophy.site_ID !== 0 ) {
					return (
						<SiteBasedAchievement
							key={ trophy.achievement_id }
							trophy={ trophy }
							trophies={ trophies }
						/>
					);
				}

				return <UserBasedAchievement key={ trophy.achievement_id } trophy={ trophy } />;
			} ) }
		</div>
	);
}
