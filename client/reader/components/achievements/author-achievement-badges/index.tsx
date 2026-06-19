import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import useAchievementsVisibility from '../use-achievements-visibility';
import { YearsOfServiceBadge } from '../years-of-service-badge';
import type { JSX } from 'react';

import './style.scss';

interface AuthorAchievementBadgesProps {
	authorLogin?: string;
	size: 'medium' | 'small';
}

export const AuthorAchievementBadges = ( {
	authorLogin,
	size,
}: AuthorAchievementBadgesProps ): JSX.Element | null => {
	const { isVisible } = useAchievementsVisibility( authorLogin );
	const { yearsOfService } = useAchievementsQuery( isVisible ? authorLogin : undefined );

	if ( ! isVisible ) {
		return null;
	}

	const badges = [
		!! yearsOfService && (
			<YearsOfServiceBadge
				key="years-of-service"
				size={ size }
				yearsOfService={ yearsOfService }
				linked
				userLogin={ authorLogin }
			/>
		),
	].filter( Boolean );

	if ( badges.length === 0 ) {
		return null;
	}

	return <span className="author-achievement-badges">{ badges }</span>;
};
