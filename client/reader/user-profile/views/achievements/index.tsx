import { isEnabled } from '@automattic/calypso-config';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import AchievementsGrid from './achievements-grid';
import AchievementsSettings from './achievements-settings';
import useAchievementsVisibility from './use-achievements-visibility';
import type { ReaderUser } from '@automattic/api-core';

import './style.scss';

interface UserAchievementsProps {
	user: ReaderUser;
}

const UserAchievements = ( { user }: UserAchievementsProps ): JSX.Element | null => {
	const translate = useTranslate();
	const { isOwnProfile, isVisible, isLoading } = useAchievementsVisibility( user.user_login );

	if ( ! isEnabled( 'reader/achievements' ) ) {
		return null;
	}

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
			<div className="achievements__header">{ isOwnProfile && <AchievementsSettings /> }</div>
			<AchievementsGrid />
		</div>
	);
};

export default UserAchievements;
