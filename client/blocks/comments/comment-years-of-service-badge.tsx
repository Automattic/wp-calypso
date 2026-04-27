import { useYearsOfService } from 'calypso/data/reader/use-years-of-service';
import useAchievementsVisibility from 'calypso/reader/user-profile/views/achievements/use-achievements-visibility';
import { YearsOfServiceBadge } from 'calypso/reader/user-profile/views/achievements/years-of-service-badge';

interface CommentYearsOfServiceBadgeProps {
	authorLogin: string;
}

export const CommentYearsOfServiceBadge = ( {
	authorLogin,
}: CommentYearsOfServiceBadgeProps ): JSX.Element | null => {
	const { isVisible } = useAchievementsVisibility( authorLogin );
	const { yearsOfService } = useYearsOfService( authorLogin );

	if ( ! isVisible || ! yearsOfService ) {
		return null;
	}

	return <YearsOfServiceBadge size="small" yearsOfService={ yearsOfService } />;
};
