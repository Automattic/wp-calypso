import './daily-info.scss';

import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { EngagementStreakDay, EngagementStreakDayStatus } from '@automattic/api-core';

const DAYS_TO_SHOW = 7;

type DayVariant = 'missed' | 'extended' | 'freeze-used' | 'freeze-earned';

function getVariant( status: EngagementStreakDayStatus, freezeEarned: boolean ): DayVariant {
	if ( status === 'extended' && freezeEarned ) {
		return 'freeze-earned';
	}
	if ( status === 'freeze_used' ) {
		return 'freeze-used';
	}
	return status;
}

function getStatusA11yLabel(
	variant: DayVariant,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( variant ) {
		case 'missed':
			return translate( 'no activity' ) as string;
		case 'extended':
			return translate( 'active' ) as string;
		case 'freeze-used':
			return translate( 'streak freeze used' ) as string;
		case 'freeze-earned':
			return translate( 'active, streak freeze earned' ) as string;
	}
}

interface DayProps {
	date: string;
	status: EngagementStreakDayStatus;
	freezeEarned: boolean;
}

function Day( { date, status, freezeEarned }: DayProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const variant = getVariant( status, freezeEarned );
	const weekdayLabel = moment( date ).format( 'ddd' );
	const fullDateLabel = moment( date ).format( 'LL' );
	const statusLabel = getStatusA11yLabel( variant, translate );
	const ariaLabel = `${ weekdayLabel }, ${ fullDateLabel }: ${ statusLabel }`;

	return (
		<div className="activity-streak__day" title={ fullDateLabel } aria-label={ ariaLabel }>
			<span className="activity-streak__day-weekday">{ weekdayLabel }</span>
			<span
				className={ clsx( 'activity-streak__day-icon', `is-${ variant }` ) }
				aria-hidden="true"
			/>
		</div>
	);
}

interface DailyInfoProps {
	days: EngagementStreakDay[];
}

export function DailyInfo( { days }: DailyInfoProps ) {
	const translate = useTranslate();
	const recentDays = days.slice( -DAYS_TO_SHOW );

	if ( recentDays.length === 0 ) {
		return null;
	}

	return (
		<div
			className="activity-streak__daily-info"
			role="group"
			aria-label={ translate( 'Recent activity' ) }
		>
			{ recentDays.map( ( day ) => (
				<Day
					key={ day.date }
					date={ day.date }
					status={ day.status }
					freezeEarned={ day.freeze_earned }
				/>
			) ) }
		</div>
	);
}
