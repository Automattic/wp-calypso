import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import {
	deduplicateAchievementsById,
	deduplicateAchievementsBySlug,
	isFullyEarned,
	isMaskedSecret,
} from '../utils';
import AnniversaryAchievement from './anniversary-achievement';
import GenericAchievement from './generic-achievement';
import LockedAchievementCard from './locked-achievement-card';
import SecretAchievementCard from './secret-achievement-card';

import './style.scss';

interface AchievementsGridProps {
	userLogin: string;
	isOwnProfile: boolean;
}

export default function AchievementsGrid( { userLogin, isOwnProfile }: AchievementsGridProps ) {
	const translate = useTranslate();
	const {
		achievements,
		lockedAchievements,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useAchievementsQuery( userLogin );

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isError ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isError, fetchNextPage ] );

	if ( isLoading || hasNextPage ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading achievements…' ) }
			</div>
		);
	}

	if ( ! achievements.length && ! lockedAchievements.length ) {
		return <p className="achievements-grid__empty">{ translate( 'No achievements yet.' ) }</p>;
	}

	const earned = achievements.filter( isFullyEarned );
	const maskedSecrets = deduplicateAchievementsById( achievements.filter( isMaskedSecret ) );
	const dedupedEarned = deduplicateAchievementsBySlug( earned );
	const sortedLocked = deduplicateAchievementsById(
		[ ...lockedAchievements ].sort( ( a, b ) => a.date_created.localeCompare( b.date_created ) )
	);

	const showCelebratory = isOwnProfile && earned.length > 0 && lockedAchievements.length === 0;
	const showLockedSection = isOwnProfile && sortedLocked.length > 0;

	return (
		<>
			{ ( dedupedEarned.length > 0 || maskedSecrets.length > 0 ) && (
				<div className="achievements-grid">
					{ dedupedEarned.map( ( a ) =>
						a.slug === 'user_anniversary' ? (
							<AnniversaryAchievement
								key={ a.achievement_id }
								achievement={ a }
								achievements={ earned }
							/>
						) : (
							<GenericAchievement
								key={ a.achievement_id }
								achievement={ a }
								achievements={ earned }
							/>
						)
					) }
					{ maskedSecrets.map( ( a ) => (
						<SecretAchievementCard key={ a.achievement_id } unlockedDate={ a.date } />
					) ) }
				</div>
			) }

			{ showCelebratory && (
				<p className="achievements-grid__celebratory">
					{ translate( 'You’ve unlocked them all! 🎉 More achievements are on the way.' ) }
				</p>
			) }

			{ showLockedSection && (
				<>
					<h2 className="achievements__locked-heading">{ translate( 'Locked achievements' ) }</h2>
					<div className="achievements-grid achievements-grid--locked">
						{ sortedLocked.map( ( a ) => (
							<LockedAchievementCard key={ a.achievement_id } entry={ a } />
						) ) }
					</div>
				</>
			) }
		</>
	);
}
