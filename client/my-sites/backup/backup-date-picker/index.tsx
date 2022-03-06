import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { useCallback, useMemo, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useDatesWithNoSuccessfulBackups } from '../status/hooks';
import DateButton from './date-button';
import { useCanGoToDate, useFirstKnownBackupAttempt } from './hooks';

import './style.scss';

const PREV_DATE_CLICK = recordTracksEvent( 'calypso_jetpack_backup_date_previous' );
const NEXT_DATE_CLICK = recordTracksEvent( 'calypso_jetpack_backup_date_next' );
const CALENDAR_DATE_CLICK = recordTracksEvent( 'calypso_jetpack_backup_date_calendar_select_day' );

const onSpace = ( fn: () => void ) => ( { key }: { key?: string } ) => {
	if ( key === ' ' ) {
		fn();
	}
};

const BackupDatePicker: FC< Props > = ( { selectedDate, onDateChange } ) => {
	const dispatch = useDispatch();

	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const today = useDateWithOffset( moment() ) as Moment;
	const previousDate = moment( selectedDate ).subtract( 1, 'day' );
	const nextDate = moment( selectedDate ).add( 1, 'day' );

	const firstKnownBackupAttempt = useFirstKnownBackupAttempt( siteId );
	const oldestDateAvailable = useDateWithOffset(
		firstKnownBackupAttempt.backupAttempt?.activityTs
	);
	// Get the oldest visible backup date.
	// This is added into the state via QueryRewindPolicies
	const visibleDays = useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) );
	// If the number of visible days is falsy, then use the oldest date as the first visible backup date.
	const firstVisibleBackupDate = visibleDays
		? today.clone().subtract( visibleDays, 'days' )
		: oldestDateAvailable;

	const hasNoBackups = useSelector( ( state ) => {
		const backups = getRewindBackups( state, siteId ) || [];
		// in-progress backups should not be counted as backups, yet.
		return ! backups.filter( ( backup ) => backup.status !== 'started' ).length;
	} );

	const canGoToDate = useCanGoToDate( siteId, selectedDate, oldestDateAvailable, hasNoBackups );
	const datesWithNoBackups = useDatesWithNoSuccessfulBackups(
		siteId,
		firstVisibleBackupDate,
		today.clone()
	);

	// Don't filter out today's date from the calendar options.
	let todayIndex;
	if ( ( todayIndex = datesWithNoBackups.dates.indexOf( today.format( 'MM-DD-YYYY' ) ) ) > -1 ) {
		datesWithNoBackups.dates.splice( todayIndex, 1 );
	}

	const { previousDisplayDate, nextDisplayDate, selectedDisplayDate } = useMemo( () => {
		const yesterday = moment( today ).subtract( 1, 'day' );

		const dateFormat = today.year() === selectedDate.year() ? 'MMM D' : 'MMM D, YYYY';

		const dateOutputs = [
			{
				label: 'previous',
				date: previousDate,
				string: previousDate.format( dateFormat ),
			},
			{
				label: 'next',
				date: nextDate,
				string: nextDate.format( dateFormat ),
			},
			{
				label: 'current',
				date: selectedDate,
				string: selectedDate.format( dateFormat ),
			},
		];

		dateOutputs.forEach( ( formatObject ) => {
			// Don't modify the "next" date control
			if ( 'next' === formatObject.label ) {
				return;
			}
			// For current and previous dates, set to say "Today" or "Yesterday" when appropriate
			if ( formatObject.date.isSame( today, 'day' ) ) {
				formatObject.string = translate( 'Today' ).toString();
			} else if ( formatObject.date.isSame( yesterday, 'day' ) ) {
				formatObject.string = translate( 'Yesterday' ).toString();
			}
		} );

		return {
			previousDisplayDate: dateOutputs[ 0 ].string,
			nextDisplayDate: dateOutputs[ 1 ].string,
			selectedDisplayDate: dateOutputs[ 2 ].string,
		};
	}, [ moment, today, selectedDate, previousDate, nextDate, translate ] );

	const { canGoToPreviousDate, canGoToNextDate } = useMemo( () => {
		return {
			canGoToPreviousDate: canGoToDate( previousDate ),
			canGoToNextDate: canGoToDate( nextDate ),
		};
	}, [ canGoToDate, previousDate, nextDate ] );

	const goToPreviousDate = useCallback( () => {
		if ( ! canGoToPreviousDate ) {
			return false;
		}

		dispatch( PREV_DATE_CLICK );
		onDateChange( previousDate );
	}, [ canGoToPreviousDate, dispatch, onDateChange, previousDate ] );

	const goToNextDate = useCallback( () => {
		if ( ! canGoToNextDate ) {
			return false;
		}

		dispatch( NEXT_DATE_CLICK );
		onDateChange( nextDate );
	}, [ canGoToNextDate, dispatch, onDateChange, nextDate ] );

	const goToCalendarDate = useCallback(
		( selectedDate ) => {
			if ( ! canGoToDate( selectedDate ) ) {
				return false;
			}

			dispatch( CALENDAR_DATE_CLICK );
			onDateChange( selectedDate );
		},
		[ canGoToDate, dispatch, onDateChange ]
	);

	return (
		<div className="backup-date-picker">
			<div className="backup-date-picker__select-date-container">
				<div className="backup-date-picker__select-date backup-date-picker__select-date--with-date-calendar-picker">
					<div
						className="backup-date-picker__select-date--previous"
						role="button"
						tabIndex={ 0 }
						onClick={ goToPreviousDate }
						onKeyDown={ onSpace( goToPreviousDate ) }
					>
						<Button compact borderless className="backup-date-picker__button--previous">
							<Gridicon
								icon="chevron-left"
								className={ ! canGoToPreviousDate ? 'disabled' : undefined }
							/>
						</Button>

						<span
							className={ classNames( 'backup-date-picker__display-date', {
								disabled: ! canGoToPreviousDate,
							} ) }
						>
							{ previousDisplayDate }
						</span>
					</div>

					<div className="backup-date-picker__current-date">
						<b>{ selectedDisplayDate }</b>
					</div>

					<div
						className="backup-date-picker__select-date--next"
						role="button"
						tabIndex={ 0 }
						onClick={ goToNextDate }
						onKeyDown={ onSpace( goToNextDate ) }
					>
						<div className="backup-date-picker__next-date-link">
							<span
								className={ classNames( 'backup-date-picker__display-date', {
									disabled: ! canGoToNextDate,
								} ) }
							>
								{ nextDisplayDate }
							</span>

							<Button compact borderless className="backup-date-picker__button--next">
								<Gridicon
									icon="chevron-right"
									className={ ! canGoToNextDate ? 'disabled' : undefined }
								/>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<DateButton
				onDateSelected={ goToCalendarDate }
				selectedDate={ selectedDate }
				firstBackupDate={ firstVisibleBackupDate }
				disabledDates={ datesWithNoBackups.dates }
			/>
		</div>
	);
};

type Props = {
	selectedDate: Moment;
	onDateChange: ( m: Moment ) => void;
};

export default BackupDatePicker;
