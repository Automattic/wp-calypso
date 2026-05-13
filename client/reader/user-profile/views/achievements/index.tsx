import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import useAchievementsVisibility from 'calypso/reader/components/achievements/use-achievements-visibility';
import { YearsOfServiceBadge } from 'calypso/reader/components/achievements/years-of-service-badge';
import AchievementsGrid from './achievements-grid';
import AchievementsSettings from './achievements-settings';
import { ActivityStreakPill } from './activity-streak-pill';
import type { ReaderUser } from '@automattic/api-core';

import './style.scss';

interface UserAchievementsProps {
	user: ReaderUser;
}

const UserAchievements = ( { user }: UserAchievementsProps ): JSX.Element | null => {
	const translate = useTranslate();
	const { isOwnProfile, isVisible, isLoading } = useAchievementsVisibility( user.user_login );
	const { yearsOfService, engagementStreak } = useAchievementsQuery(
		isVisible ? user.user_login : undefined,
		{
			refetchOnMount: 'always',
		}
	);

	if ( isLoading ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading…' ) }
			</div>
		);
	}

	if ( ! isVisible ) {
		return null;
	}

	return (
		<div className="achievements">
			<div className="achievements__header">
				{ !! yearsOfService && (
					<YearsOfServiceBadge size="large" yearsOfService={ yearsOfService } />
				) }
				<ActivityStreakPill streak={ engagementStreak } isOwnProfile={ isOwnProfile } />
				{ isOwnProfile && <AchievementsSettings /> }
			</div>
			<AchievementsGrid userLogin={ user.user_login } isOwnProfile={ isOwnProfile } />
		</div>
	);
};

export default UserAchievements;
