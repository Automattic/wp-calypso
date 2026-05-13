import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	StreakBadge,
	type StreakBadgeState,
} from 'calypso/reader/components/achievements/streak-badge';
import type { EngagementStreak } from '@automattic/api-core';

import './style.scss';

interface ActivityStreakProps {
	streak: EngagementStreak | undefined;
	isOwnProfile: boolean;
}

const SEPARATOR = ' · ';

const LONGEST_ACTIVE_MIN_STREAK = 10;

// "Today" comes from the browser's local date. The server returns
// last_streak_date in the user's account timezone — close enough for users
// whose browser TZ matches their account TZ, with at worst a day-off mismatch
// otherwise. The badge is a profile decoration, not a source of truth.
function deriveBadgeState( streak: EngagementStreak, today: string ): StreakBadgeState {
	if ( streak.current_streak === 0 || streak.last_streak_date !== today ) {
		return 'inactive';
	}
	if (
		streak.current_streak >= streak.longest_streak &&
		streak.current_streak >= LONGEST_ACTIVE_MIN_STREAK
	) {
		return 'longest-active';
	}
	return 'active';
}

export function ActivityStreak( { streak, isOwnProfile }: ActivityStreakProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( ! streak ) {
		return null;
	}

	if ( streak.current_streak === 0 && ! isOwnProfile ) {
		return null;
	}

	const badgeState = deriveBadgeState( streak, moment().format( 'YYYY-MM-DD' ) );

	if ( streak.current_streak === 0 ) {
		return (
			<div
				className="activity-streak activity-streak--coaching"
				role="group"
				aria-label={ translate( 'Activity streak' ) }
			>
				<StreakBadge streak={ streak.current_streak } state={ badgeState } />
				<div className="activity-streak__content">
					<div className="activity-streak__headline">
						<span className="activity-streak__emoji" aria-hidden="true">
							🔥
						</span>
						<span>{ translate( 'Start your activity streak today' ) }</span>
					</div>
					<div className="activity-streak__sub-line">
						{ translate( 'Like, comment, follow, or post — anything counts.' ) }
					</div>
				</div>
			</div>
		);
	}

	let freezeChip: string;
	if ( streak.freezes_available > 0 ) {
		freezeChip = translate( '%(count)d freeze available', '%(count)d freezes available', {
			count: streak.freezes_available,
			args: { count: streak.freezes_available },
			comment:
				'Sub-line chip on the activity streak pill. Shown when the user has banked streak freezes. Example: "1 freeze available" or "2 freezes available".',
		} ) as string;
	} else if ( streak.freeze_used_date && streak.next_freeze_in_days >= 1 ) {
		freezeChip = translate( 'freeze used %(relative)s', {
			args: { relative: moment( streak.freeze_used_date ).fromNow() },
			comment:
				'Sub-line chip on the activity streak pill. Shown when the user recently used a streak freeze to cover a missed day. %(relative)s is a relative time like "yesterday" or "2 days ago".',
		} ) as string;
	} else {
		freezeChip = translate( 'next freeze in %(count)d day', 'next freeze in %(count)d days', {
			count: streak.next_freeze_in_days,
			args: { count: streak.next_freeze_in_days },
			comment:
				'Sub-line chip on the activity streak pill. Shown when the user has no freeze banked and is climbing toward earning the next one.',
		} ) as string;
	}

	const subLineChips: string[] = [];
	if ( streak.longest_streak !== streak.current_streak ) {
		subLineChips.push(
			translate( 'Longest %(count)d', {
				args: { count: streak.longest_streak },
				comment:
					'Abbreviated label for the longest activity streak count shown in the streak pill. Example: "Longest 28" means the user\'s longest streak was 28 days.',
			} ) as string
		);
	}
	subLineChips.push( freezeChip );

	const streakExplainer = translate(
		'Like, comment, follow, or post — anything counts.'
	) as string;
	const freezeExplainer = translate(
		'A streak freeze automatically protects your streak when you miss a day.'
	) as string;
	const freezeEarnAppend =
		streak.next_freeze_in_days > 0
			? ( translate(
					'You will earn one in %(count)d more active day.',
					'You will earn one in %(count)d more active days.',
					{
						count: streak.next_freeze_in_days,
						args: { count: streak.next_freeze_in_days },
						comment:
							'Trailing sentence appended to the activity-streak pill tooltip when the user has no freeze banked. Tells them how many more active days until they earn one.',
					}
			  ) as string )
			: '';
	const freezeLine = [ freezeExplainer, freezeEarnAppend ].filter( Boolean ).join( ' ' );
	const tooltipContent = (
		<span className="activity-streak__tooltip">
			<span className="activity-streak__tooltip-line">{ streakExplainer }</span>
			<span className="activity-streak__tooltip-line">{ freezeLine }</span>
		</span>
	);

	return (
		// @wordpress/components types Tooltip's `text` as `string`, but the runtime
		// accepts a ReactNode. Pass the JSX wrapper so we can control width and stack
		// the two sentences. Cast keeps the build green without changing behavior.
		<Tooltip text={ tooltipContent as unknown as string }>
			<div
				className="activity-streak"
				role="group"
				aria-label={ translate( 'Activity streak' ) }
				tabIndex={ 0 } // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
			>
				<StreakBadge streak={ streak.current_streak } state={ badgeState } />
				<StreakBadge streak={ streak.current_streak } state="active" />
				<StreakBadge streak={ streak.current_streak } state="longest-active" />
				<div className="activity-streak__content">
					<div className="activity-streak__headline">
						<span className="activity-streak__emoji" aria-hidden="true">
							🔥
						</span>
						<span>
							{ translate( '{{strong}}%(count)d{{/strong}}-day activity streak', {
								args: { count: streak.current_streak },
								components: { strong: <strong /> },
							} ) }
						</span>
					</div>
					<div className="activity-streak__sub-line">{ subLineChips.join( SEPARATOR ) }</div>
				</div>
			</div>
		</Tooltip>
	);
}
