import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	StreakBadge,
	type StreakBadgeState,
} from 'calypso/reader/components/achievements/streak-badge';
import type { EngagementStreak } from '@automattic/api-core';
import type { ReactNode } from 'react';

import './style.scss';

interface ActivityStreakProps {
	streak: EngagementStreak | undefined;
	isOwnProfile: boolean;
}

// Wraps a "streak freeze" mention so a tooltip explains the feature on hover
// or focus. Used as an i18n component placeholder, so it receives the term's
// translated text as children.
function StreakFreezeTerm( { children }: { children?: ReactNode } ) {
	const translate = useTranslate();
	return (
		<Tooltip
			text={
				translate(
					'A streak freeze automatically protects your streak when you miss a day.'
				) as string
			}
		>
			<span
				className="activity-streak__term"
				tabIndex={ 0 } // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
			>
				{ children }
			</span>
		</Tooltip>
	);
}

type ActivityStreakMode =
	| 'never-started'
	| 'lost'
	| 'pending'
	| 'pending-frozen'
	| 'engaged'
	| 'engaged-record';

interface ModeContent {
	badgeState: StreakBadgeState;
	badgeLabel: string;
	description: ReactNode;
}

const LONGEST_ACTIVE_MIN_STREAK = 10;

// "Today" comes from the browser's local date. The server returns
// last_streak_date / freeze_used_date in the user's account timezone — close
// enough for users whose browser TZ matches their account TZ, with at worst a
// day-off mismatch otherwise. The badge is a profile decoration, not a source
// of truth.
function deriveMode(
	streak: EngagementStreak,
	today: string,
	yesterday: string
): ActivityStreakMode {
	if ( streak.current_streak === 0 ) {
		return streak.longest_streak > 0 ? 'lost' : 'never-started';
	}
	if ( streak.last_streak_date !== today ) {
		return streak.freeze_used_date === yesterday ? 'pending-frozen' : 'pending';
	}
	if (
		streak.current_streak >= streak.longest_streak &&
		streak.current_streak >= LONGEST_ACTIVE_MIN_STREAK
	) {
		return 'engaged-record';
	}
	return 'engaged';
}

function getModeContent(
	mode: ActivityStreakMode,
	streak: EngagementStreak,
	translate: ReturnType< typeof useTranslate >
): ModeContent {
	switch ( mode ) {
		case 'never-started':
			return {
				badgeState: 'inactive',
				badgeLabel: translate( 'Get started!' ) as string,
				description: translate(
					'Start your activity streak today.{{br/}}Like, comment, follow, or post — anything counts.',
					{ components: { br: <br /> } }
				),
			};
		case 'lost':
			return {
				badgeState: 'inactive',
				badgeLabel: translate( 'Try again!' ) as string,
				description: translate(
					'Restart your activity streak today.{{br/}}Like, comment, follow, or post — anything counts.',
					{ components: { br: <br /> } }
				),
			};
		case 'pending':
			return {
				badgeState: 'inactive',
				badgeLabel: translate( 'Don’t break it!' ) as string,
				description: translate( 'Like, comment, follow, or post every day to build your streak.' ),
			};
		case 'pending-frozen':
			return {
				badgeState: 'frozen',
				badgeLabel: translate( 'Streak frozen' ) as string,
				description: translate(
					'A {{term}}streak freeze{{/term}} protected your streak yesterday.{{br/}}Like, comment, follow, or post every day to build your streak.',
					{ components: { term: <StreakFreezeTerm />, br: <br /> } }
				),
			};
		case 'engaged':
			return {
				badgeState: 'active',
				badgeLabel: translate( 'You’re on a streak!' ) as string,
				description: translate(
					'Like, comment, follow, or post every day to keep building your streak.'
				),
			};
		case 'engaged-record':
			return {
				badgeState: 'longest-active',
				badgeLabel: translate( 'You’re on fire!' ) as string,
				description: translate(
					'Congrats on using WordPress.com for %(count)d day in a row! It’s your longest streak so far!',
					'Congrats on using WordPress.com for %(count)d days in a row! It’s your longest streak so far!',
					{
						count: streak.current_streak,
						args: { count: streak.current_streak },
					}
				),
			};
	}
}

function getFreezeDescription(
	streak: EngagementStreak,
	translate: ReturnType< typeof useTranslate >
): ReactNode | null {
	if ( streak.current_streak === 0 ) {
		return null;
	}
	if ( streak.freezes_available > 0 ) {
		return translate(
			'%(count)d {{term}}streak freeze{{/term}} available.',
			'%(count)d {{term}}streak freezes{{/term}} available.',
			{
				count: streak.freezes_available,
				args: { count: streak.freezes_available },
				components: { term: <StreakFreezeTerm /> },
			}
		);
	}
	if ( streak.next_freeze_in_days >= 1 ) {
		return translate(
			'{{term}}Streak freeze{{/term}} available in %(count)d day.',
			'{{term}}Streak freeze{{/term}} available in %(count)d days.',
			{
				count: streak.next_freeze_in_days,
				args: { count: streak.next_freeze_in_days },
				components: { term: <StreakFreezeTerm /> },
			}
		);
	}
	return null;
}

function getRecordDescription(
	streak: EngagementStreak,
	translate: ReturnType< typeof useTranslate >
): ReactNode | null {
	if ( streak.current_streak >= streak.longest_streak ) {
		return null;
	}

	return translate(
		'Your longest streak on record is %(count)d day.',
		'Your longest streak on record is %(count)d days.',
		{
			count: streak.longest_streak,
			args: { count: streak.longest_streak },
		}
	);
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

	const today = moment().format( 'YYYY-MM-DD' );
	const yesterday = moment().subtract( 1, 'day' ).format( 'YYYY-MM-DD' );
	const mode = deriveMode( streak, today, yesterday );
	const { badgeState, badgeLabel, description } = getModeContent( mode, streak, translate );
	const recordDescription = getRecordDescription( streak, translate );
	const freezeDescription = getFreezeDescription( streak, translate );

	return (
		<div className="activity-streak" role="group" aria-label={ translate( 'Activity streak' ) }>
			<StreakBadge streak={ streak.current_streak } state={ badgeState } label={ badgeLabel } />
			<div className="activity-streak__content">
				<div className="activity-streak__title">{ translate( 'Activity Streak' ) }</div>
				<div className="activity-streak__description">
					<p>{ description }</p>
					{ recordDescription && <p>{ recordDescription }</p> }
					{ freezeDescription && <p>{ freezeDescription }</p> }
				</div>
			</div>
		</div>
	);
}
