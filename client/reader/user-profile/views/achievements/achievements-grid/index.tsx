import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import { deduplicateAchievementsById, deduplicateAchievementsBySlug } from '../utils';
import AnniversaryAchievement from './anniversary-achievement';
import DailyPostStreakCard from './daily-post-streak-card';
import GenericAchievement from './generic-achievement';
import LockedAchievementCard from './locked-achievement-card';
import SecretAchievementCard from './secret-achievement-card';
import YearsOfServiceAchievementCard from './years-of-service-achievement-card';
import type { Achievement, MaskedSecretAchievement } from '@automattic/api-core';

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
		yearsOfService,
		dailyPostStreaks,
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

	if (
		! achievements.length &&
		! lockedAchievements.length &&
		! yearsOfService &&
		! dailyPostStreaks.length
	) {
		return <p className="achievements-grid__empty">{ translate( 'No achievements yet.' ) }</p>;
	}

	const earned: Achievement[] = [];
	const maskedSecretsRaw: MaskedSecretAchievement[] = [];
	for ( const a of achievements ) {
		if ( a.is_redacted ) {
			maskedSecretsRaw.push( a );
		} else {
			earned.push( a );
		}
	}
	const maskedSecrets = deduplicateAchievementsById( maskedSecretsRaw );

	// Earned + masked secrets sorted by `date_unlocked` descending — most
	// recently unlocked first. Dedupe by slug already returns the latest unlock
	// per slug, so sorting on `date_unlocked` is correct for leveled achievements
	// too. Tolerate missing values during the endpoint rollout.
	const sortedEarned = [ ...deduplicateAchievementsBySlug( earned ), ...maskedSecrets ].sort(
		( a, b ) => ( b.date_unlocked ?? '' ).localeCompare( a.date_unlocked ?? '' )
	);

	// Locked entries have no unlock date — sort by registry creation date,
	// oldest first. Tolerate missing `date_created` during the endpoint rollout
	// (otherwise `localeCompare` on undefined throws).
	const sortedLocked = deduplicateAchievementsById(
		[ ...lockedAchievements ].sort( ( a, b ) =>
			( a.date_created ?? '' ).localeCompare( b.date_created ?? '' )
		)
	);

	const showYearsOfService = !! yearsOfService;
	const showStreakCards = isOwnProfile && ( dailyPostStreaks?.length ?? 0 ) > 0;
	const showCelebratory = isOwnProfile && earned.length > 0 && lockedAchievements.length === 0;
	const showLockedSection = isOwnProfile && sortedLocked.length > 0;
	const showEarnedGrid = sortedEarned.length > 0 || showYearsOfService || showStreakCards;

	return (
		<>
			{ showEarnedGrid && (
				<div className="achievements-grid">
					{ showYearsOfService && (
						<YearsOfServiceAchievementCard yearsOfService={ yearsOfService } />
					) }
					{ showStreakCards &&
						dailyPostStreaks.map( ( streak ) => (
							<DailyPostStreakCard key={ streak.blog_id } streak={ streak } />
						) ) }
					{ sortedEarned.map( ( a ) => {
						if ( a.is_redacted ) {
							return (
								<SecretAchievementCard key={ a.achievement_id } unlockedDate={ a.date_unlocked } />
							);
						}
						if ( a.slug === 'user_anniversary' ) {
							return (
								<AnniversaryAchievement
									key={ a.achievement_id }
									achievement={ a }
									achievements={ earned }
								/>
							);
						}
						return (
							<GenericAchievement
								key={ a.achievement_id }
								achievement={ a }
								achievements={ earned }
								isOwnProfile={ isOwnProfile }
							/>
						);
					} ) }
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
