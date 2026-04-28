import { useYearsOfService } from 'calypso/data/reader/use-years-of-service';
import useAchievementsVisibility from '../use-achievements-visibility';
import { YearsOfServiceBadge } from '../years-of-service-badge';

interface AuthorAchievementBadgesProps {
	authorLogin?: string;
	size: 'medium' | 'small';
}

export const AuthorAchievementBadges = ( {
	authorLogin,
	size,
}: AuthorAchievementBadgesProps ): JSX.Element | null => {
	const { isVisible } = useAchievementsVisibility( authorLogin );
	const { yearsOfService } = useYearsOfService( authorLogin );

	if ( ! isVisible ) {
		return null;
	}

	const badges = [
		!! yearsOfService && (
			<YearsOfServiceBadge key="years-of-service" size={ size } yearsOfService={ yearsOfService } />
		),
	].filter( Boolean );

	if ( badges.length === 0 ) {
		return null;
	}

	return <span className="author-achievement-badges">{ badges }</span>;
};
