import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useTrophiesQuery } from 'calypso/data/reader/use-trophies-query';
import type { ReaderUser } from '@automattic/api-core';

interface UserAchievementsProps {
	user: ReaderUser;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserAchievements = ( { user }: UserAchievementsProps ): JSX.Element | null => {
	const translate = useTranslate();
	const { found, isLoading } = useTrophiesQuery();

	if ( isLoading ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading achievements…' ) }
			</div>
		);
	}

	return (
		<p>
			{ translate( 'Found %(count)d achievement', 'Found %(count)d achievements', {
				count: found,
				args: { count: found },
			} ) }
		</p>
	);
};

export default UserAchievements;
