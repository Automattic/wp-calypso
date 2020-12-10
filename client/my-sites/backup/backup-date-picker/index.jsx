/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import Button from 'calypso/components/forms/form-button';
import DateRangeSelector from 'calypso/my-sites/activity/filterbar/date-range-selector';
import Gridicon from 'calypso/components/gridicon';
import { useDateWithOffset, useFirstMatchingBackupAttempt } from '../hooks';

/**
 * Style dependencies
 */
import './style.scss';

const SEARCH_LINK_CLICK = recordTracksEvent( 'calypso_jetpack_backup_search' );
const PREV_DATE_CLICK = recordTracksEvent( 'calypso_jetpack_backup_date_previous' );
const NEXT_DATE_CLCK = recordTracksEvent( 'calypso_jetpack_backup_date_next' );

const useTodayForSelectedSite = () => {
	const moment = useLocalizedMoment();

	const siteId = useSelector( getSelectedSiteId );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );

	return applySiteOffset( moment(), { gmtOffset, timezone } );
};

const useCanGoToDate = ( selectedDate, oldestDateAvailable ) => {
	const today = useTodayForSelectedSite();

	return useCallback(
		( desiredDate ) => {
			// If we're somehow further back than the oldest available date,
			// only allow forward movement
			if ( selectedDate.isBefore( oldestDateAvailable, 'day' ) ) {
				return desiredDate.isAfter( selectedDate, 'day' );
			}

			// If we're somehow further forward than today,
			// only allow backward movement
			if ( selectedDate.isAfter( today, 'day' ) ) {
				return desiredDate.isBefore( selectedDate, 'day' );
			}

			// If we don't know the oldest available date,
			// allow infinite backward navigation
			if ( ! oldestDateAvailable ) {
				return desiredDate.isSameOrBefore( today, 'day' );
			}

			// Allow any movement within the range of "valid" dates
			// (i.e., between the oldest date and the present date)
			return desiredDate.isBetween( oldestDateAvailable, today, 'day', '[]' );
		},
		[ selectedDate, today, oldestDateAvailable ]
	);
};

const useFirstKnownBackupAttempt = ( siteId ) => {
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};

const onSpace = ( evt, fn ) => {
	if ( evt.key === ' ' ) {
		return fn;
	}

	return () => {};
};

const BackupDatePicker = ( { selectedDate, onDateChange } ) => {
	const dispatch = useDispatch();
	const trackSearchLinkClick = () => dispatch( SEARCH_LINK_CLICK );

	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const today = useTodayForSelectedSite();
	const previousDate = moment( selectedDate ).subtract( 1, 'day' );
	const nextDate = moment( selectedDate ).add( 1, 'day' );

	const firstKnownBackupAttempt = useFirstKnownBackupAttempt( siteId );
	const oldestDateAvailable = useDateWithOffset(
		firstKnownBackupAttempt.backupAttempt?.activityTs,
		{ shouldExecute: !! firstKnownBackupAttempt.backupAttempt }
	);

	const canGoToDate = useCanGoToDate( selectedDate, oldestDateAvailable );

	const { previousDisplayDate, nextDisplayDate } = useMemo( () => {
		const yesterday = moment( today ).subtract( 1, 'day' );

		const dateFormat = today.year() === selectedDate.year() ? 'MMM D' : 'MMM D, YYYY';

		let _previousDisplayDate;
		if ( previousDate.isSame( today, 'day' ) ) {
			// Should never happen unless we manually change
			// the URL to travel into the future
			_previousDisplayDate = translate( 'Today' );
		} else if ( previousDate.isSame( yesterday, 'day' ) ) {
			_previousDisplayDate = translate( 'Yesterday' );
		} else {
			_previousDisplayDate = previousDate.format( dateFormat );
		}

		return {
			previousDisplayDate: _previousDisplayDate,
			nextDisplayDate: nextDate.format( dateFormat ),
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

		dispatch( NEXT_DATE_CLCK );
		onDateChange( nextDate );
	}, [ canGoToNextDate, dispatch, onDateChange, nextDate ] );

	return (
		<div className="backup-date-picker">
			<div className="backup-date-picker__select-date">
				<div
					className="backup-date-picker__select-date--previous"
					role="button"
					tabIndex={ 0 }
					onClick={ goToPreviousDate }
					onKeyDown={ onSpace( goToPreviousDate ) }
				>
					<Button compact borderless className="backup-date-picker__button--previous">
						<Gridicon icon="chevron-left" className={ ! canGoToPreviousDate && 'disabled' } />
					</Button>

					<span
						className={ classNames( 'backup-date-picker__display-date', {
							disabled: ! canGoToPreviousDate,
						} ) }
					>
						{ previousDisplayDate }
					</span>
				</div>

				{ isEnabled( 'jetpack/backups-date-picker' ) && (
					<DateRangeSelector
						siteId={ siteId }
						enabled={ true }
						customLabel={ <Gridicon icon="calendar" /> }
					/>
				) }

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
							<Gridicon icon="chevron-right" className={ ! canGoToNextDate && 'disabled' } />
						</Button>
					</div>
					{ isEnabled( 'jetpack/backups-date-picker' ) && (
						<a
							className="backup-date-picker__search-link"
							href={ `/activity-log/${ siteSlug }` }
							onClick={ trackSearchLinkClick }
						>
							<Gridicon icon="search" className="backup-date-picker__search-icon" />
						</a>
					) }
				</div>
			</div>
		</div>
	);
};

export default BackupDatePicker;
