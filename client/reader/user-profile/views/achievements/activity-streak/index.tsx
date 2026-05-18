import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	StreakBadge,
	type StreakBadgeState,
} from 'calypso/reader/components/achievements/streak-badge';
import { DailyInfo } from './daily-info';
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
				badgeLabel: translate( 'Keep it going!' ) as string,
				description: translate( 'Like, comment, follow, or post today to keep your streak going.' ),
			};
		case 'pending-frozen':
			return {
				badgeState: 'frozen',
				badgeLabel: translate( 'Close call!' ) as string,
				description: translate(
					'A {{term}}streak freeze{{/term}} protected your streak yesterday.{{br/}}Like, comment, follow, or post today to keep it going.',
					{ components: { term: <StreakFreezeTerm />, br: <br /> } }
				),
			};
		case 'engaged':
			return {
				badgeState: 'active',
				badgeLabel: translate( 'You’re on a streak!' ) as string,
				description: translate(
					'Today counted! Like, comment, follow, or post every day to keep building your streak.'
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

type StreakStatVariant = 'freeze' | 'record';

interface StreakStatProps {
	variant: StreakStatVariant;
	shortText: ReactNode;
	tooltipText: string;
}

function StreakStat( { variant, shortText, tooltipText }: StreakStatProps ) {
	return (
		<Tooltip className="activity-streak__stat-tooltip" text={ tooltipText }>
			<span
				className="activity-streak__stat"
				tabIndex={ 0 } // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
			>
				<span className={ `activity-streak__stat-icon is-${ variant }` } aria-hidden="true" />
				<span className="activity-streak__stat-text">{ shortText }</span>
			</span>
		</Tooltip>
	);
}

function getFreezeStat(
	streak: EngagementStreak,
	translate: ReturnType< typeof useTranslate >
): ReactNode | null {
	if ( streak.current_streak === 0 ) {
		return null;
	}
	const explanation = translate(
		'A streak freeze automatically protects your streak when you miss a day.'
	) as string;
	if ( streak.freezes_available > 0 ) {
		const count = streak.freezes_available;
		const shortText = translate( '%(count)d available', '%(count)d available', {
			count,
			args: { count },
		} );
		const longSentence = translate(
			'%(count)d streak freeze available.',
			'%(count)d streak freezes available.',
			{ count, args: { count } }
		) as string;
		return (
			<StreakStat
				variant="freeze"
				shortText={ shortText }
				tooltipText={ `${ longSentence }\n\n${ explanation }` }
			/>
		);
	}
	if ( streak.next_freeze_in_days >= 1 ) {
		const count = streak.next_freeze_in_days;
		const shortText = translate( 'available in %(count)d day', 'available in %(count)d days', {
			count,
			args: { count },
		} );
		const longSentence = translate(
			'Streak freeze available in %(count)d day.',
			'Streak freeze available in %(count)d days.',
			{ count, args: { count } }
		) as string;
		return (
			<StreakStat
				variant="freeze"
				shortText={ shortText }
				tooltipText={ `${ longSentence }\n\n${ explanation }` }
			/>
		);
	}
	return null;
}

function getRecordStat(
	streak: EngagementStreak,
	translate: ReturnType< typeof useTranslate >
): ReactNode | null {
	if ( streak.longest_streak === 0 ) {
		return null;
	}
	const count = streak.longest_streak;
	const shortText = translate( '%(count)d day', '%(count)d days', {
		count,
		args: { count },
	} );
	const tooltipText = translate(
		'Your longest streak on record is %(count)d day.',
		'Your longest streak on record is %(count)d days.',
		{ count, args: { count } }
	) as string;
	return <StreakStat variant="record" shortText={ shortText } tooltipText={ tooltipText } />;
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
	const recordStat = getRecordStat( streak, translate );
	const freezeStat = getFreezeStat( streak, translate );

	return (
		<div className="activity-streak" role="group" aria-label={ translate( 'Activity streak' ) }>
			<StreakBadge streak={ streak.current_streak } state={ badgeState } label={ badgeLabel } />
			<div className="activity-streak__content">
				<div className="activity-streak__title">{ translate( 'Activity Streak' ) }</div>
				<div className="activity-streak__description">
					<p>{ description }</p>
				</div>
				{ ( recordStat || freezeStat ) && (
					<div className="activity-streak__stats">
						{ recordStat }
						{ freezeStat }
					</div>
				) }
				{ streak.days && streak.days.length > 0 && <DailyInfo days={ streak.days } /> }
			</div>
		</div>
	);
}
